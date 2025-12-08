const pool = require('../db/dbConnection');
const projectRepository = require('../repositories/projectRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { validateProjectCompleteness } = require('../utils/projectValidation');

class ProjectService {

    /**
     * Crea un nuevo proyecto completo.
     * Maneja transacción para proyecto, imágenes y documentos.
     */
    async createProject(userId, projectDTO, filesDTO) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Lógica de negocio: Calcular duración
            let durationDays = null;
            if (projectDTO.end_date) {
                const start = projectDTO.start_date ? new Date(projectDTO.start_date) : new Date();
                const end = new Date(projectDTO.end_date);
                durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            }

            // 2. Crear Proyecto
            const projectData = {
                owner_id: userId,
                category_id: parseInt(projectDTO.category_id),
                title: projectDTO.title,
                short_description: projectDTO.summary,
                story_json: projectDTO.description_json ? JSON.parse(projectDTO.description_json) : {},
                goal_amount: parseFloat(projectDTO.goal_amount),
                duration_days: durationDays,
                started_at: projectDTO.start_date || null,
                deadline_at: projectDTO.end_date || null,
                approval_status: projectDTO.approval_status || 'borrador'
            };

            const project = await projectRepository.create(projectData, client);
            const projectId = project.id;

            // 3. Procesar e insertar Imágenes
            if (filesDTO.mainImage) {
                await projectRepository.saveImage({
                    project_id: projectId,
                    image_path: filesDTO.mainImage.filename,
                    original_filename: filesDTO.mainImage.originalname,
                    is_cover: true
                }, client);
            }

            // 4. Procesar e insertar Documentos
            if (filesDTO.documents && filesDTO.documents.length > 0) {
                for (const doc of filesDTO.documents) {
                    await projectRepository.saveDocument({
                        project_id: projectId,
                        requirement_id: null, // Genérico por ahora
                        file_path: doc.filename,
                        original_filename: doc.originalname,
                        mime_type: doc.mimetype
                    }, client);
                }
            }

            // 5. Requisitos de texto (si aplica)
            if (projectDTO.requirements_text && (!filesDTO.documents || filesDTO.documents.length === 0)) {
                // NOTA: La implementación del repositorio asume estructura file-based. 
                // Adaptamos la lógica de negocio para omitir o guardar como archivo vacio si es necesario, 
                // pero por ahora seguiremos la lógica original del controller que intentaba guardar esto.
                // Si el repo falla, se lanzará excepción.
            }

            await client.query('COMMIT');

            // Retornar objeto enriquecido
            return {
                id: projectId,
                title: project.title,
                status: project.approval_status,
                created_at: project.created_at
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Endpoint unificado para guardar/actualizar (RF-PROY-01)
     */
    async saveProjectUnified(userId, projectDTO, imagesData, requirementsData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let projectId = projectDTO.id;
            let resultId;

            // Validaciones de negocio
            if (!projectDTO.title || projectDTO.title.trim() === '') {
                throw new Error('El título es obligatorio');
            }

            const dataToSave = {
                title: projectDTO.title,
                short_description: projectDTO.short_description,
                story_json: typeof projectDTO.story_json === 'string' ? JSON.parse(projectDTO.story_json) : (projectDTO.story_json || {}),
                goal_amount: projectDTO.goal_amount ? parseFloat(projectDTO.goal_amount) : null,
                duration_days: projectDTO.duration_days ? parseInt(projectDTO.duration_days) : null,
                started_at: projectDTO.started_at || null,
                deadline_at: projectDTO.deadline_at || null,
                approval_status: projectDTO.approval_status || 'borrador',
                category_id: projectDTO.category_id
            };

            if (projectId) {
                // UPDATE
                // Verificar propiedad
                const ownerCheck = await projectRepository.getById(projectId, userId);
                if (!ownerCheck) throw new Error("PROYECTO_NO_ENCONTRADO");

                await projectRepository.update(projectId, userId, dataToSave, client);
                resultId = projectId;
            } else {
                // CREATE
                dataToSave.owner_id = userId; // Solo necesario en create
                const newProj = await projectRepository.create(dataToSave, client);
                resultId = newProj.id;
            }

            // Manejo de Imágenes
            if (imagesData && imagesData.length > 0) {
                for (const img of imagesData) {
                    // Si es cover, limpiar anterior
                    if (img.is_cover) {
                        await projectRepository.updateImagesStatus(resultId, { is_cover: false }, { project_id: resultId }, client);
                    }
                    await projectRepository.saveImage({
                        project_id: resultId,
                        image_path: img.image_path,
                        original_filename: img.original_filename,
                        is_cover: img.is_cover
                    }, client);
                }
            }

            // Manejo de Requisitos
            if (requirementsData && requirementsData.length > 0) {
                for (const req of requirementsData) {
                    // Borrar previo
                    await projectRepository.deleteRequirementAnswer(resultId, req.requirement_id, client);

                    await projectRepository.saveDocument({
                        project_id: resultId,
                        requirement_id: req.requirement_id,
                        file_path: req.file_path,
                        original_filename: req.original_filename,
                        mime_type: req.mime_type
                    }, client);
                }
            }

            await client.query('COMMIT');
            return { projectId: resultId, isUpdate: !!projectId };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Guardado incremental de borradores
     */
    async saveDraft(userId, draftDTO) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let projectId = draftDTO.id;

            // 1. Crear o Actualizar Proyecto Base
            if (projectId) {
                const ownerCheck = await projectRepository.getById(projectId, userId);
                if (!ownerCheck) throw new Error("PROYECTO_NO_ENCONTRADO");

                await projectRepository.update(projectId, userId, draftDTO, client);
            } else {
                const createData = {
                    owner_id: userId,
                    title: draftDTO.title || "Sin Título",
                    category_id: draftDTO.category_id || 1,
                    story_json: draftDTO.story_json || {},
                    short_description: draftDTO.short_description,
                    goal_amount: draftDTO.goal_amount,
                    deadline_at: draftDTO.deadline_at,
                    approval_status: 'borrador'
                };
                const newProj = await projectRepository.create(createData, client);
                projectId = newProj.id;
            }

            // 2. Sincronizar imágenes desde Story JSON (Editor.js)
            if (draftDTO.story_json) {
                await this._syncStoryImages(client, projectId, draftDTO.story_json);
            }

            // 3. Manejo de Galería de Imágenes
            if (draftDTO.images && Array.isArray(draftDTO.images) && draftDTO.images.length > 0) {
                // Resetear cover si viene uno nuevo
                const hasNewCover = draftDTO.images.some(img => img.is_cover || img.isCover);
                if (hasNewCover) {
                    await projectRepository.updateImagesStatus(projectId, { is_cover: false }, { project_id: projectId }, client);
                }

                for (const img of draftDTO.images) {
                    let path = img.url || img.image_path;
                    if (path) {
                        path = path.replace(/^(\/)?uploads\/img\//, '').replace(/^\//, '');
                    }
                    const name = img.name || img.original_filename;
                    const isCover = img.isCover || img.is_cover || false;

                    if (path) {
                        const existing = await projectRepository.findImageByPath(projectId, path, client);
                        if (!existing) {
                            await projectRepository.saveImage({
                                project_id: projectId,
                                image_path: path,
                                original_filename: name,
                                is_cover: isCover
                            }, client);
                        } else if (hasNewCover && isCover) {
                            // Actualizar estado cover de imagen existente
                            await projectRepository.setCoverImage(existing.id, client);
                        }
                    }
                }
            }

            // 4. Manejo de Portada legacy (campo suelto)
            if (draftDTO.cover_image) {
                await projectRepository.updateImagesStatus(projectId, { is_cover: false }, { project_id: projectId }, client);

                const existing = await projectRepository.findImageByPath(projectId, draftDTO.cover_image, client);
                if (existing) {
                    await projectRepository.setCoverImage(existing.id, client);
                } else {
                    await projectRepository.saveImage({
                        project_id: projectId,
                        image_path: draftDTO.cover_image,
                        original_filename: draftDTO.cover_image,
                        is_cover: true
                    }, client);
                }
            }

            await client.query('COMMIT');
            return projectId;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Lógica de sincronización de imágenes del editor (Privada)
     */
    async _syncStoryImages(client, projectId, storyJson) {
        const currentImages = [];
        if (storyJson && storyJson.blocks) {
            storyJson.blocks.forEach(block => {
                if (block.type === 'image' && block.data && block.data.file && block.data.file.url) {
                    const path = block.data.file.url;
                    currentImages.push(path);
                }
            });
        }

        for (const imgPath of currentImages) {
            const existing = await projectRepository.findImageByPath(projectId, imgPath, client);
            if (!existing) {
                const filename = imgPath.split('/').pop();
                await projectRepository.saveImage({
                    project_id: projectId,
                    image_path: imgPath,
                    original_filename: filename,
                    is_cover: false
                }, client);
            }
        }
    }

    async getProjectById(projectId, userId) {
        // Intenta obtener propio, sino público
        let project = await projectRepository.getById(projectId, userId);
        if (!project) {
            project = await projectRepository.getPublicById(projectId);
        }
        return project;
    }

    async getAllProjects(userId, queryParams) {
        if (userId) {
            return await projectRepository.getByUserId(userId, queryParams.status);
        }
        return await projectRepository.getAllPublic(queryParams);
    }

    async searchProjects(filters) {
        return await projectRepository.searchProjects(filters);
    }

    async getGlobalStats() {
        return await projectRepository.getGlobalStats();
    }

    async submitProject(projectId, userId) {
        const project = await projectRepository.getById(projectId, userId);
        if (!project) throw new Error("PROYECTO_NO_ENCONTRADO");

        if (project.approval_status !== 'borrador' && project.approval_status !== 'observado') {
            throw new Error("ESTADO_INVALIDO");
        }

        // Validaciones de Integridad
        const images = await projectRepository.getProjectImages(projectId);
        const answers = await projectRepository.getProjectDocuments(projectId);
        const requirements = await categoryRepository.getCategoryRequirements(project.category_id);

        const validation = validateProjectCompleteness(project, images, requirements, answers);
        if (!validation.valid) {
            const error = new Error("PROYECTO_INCOMPLETO");
            error.details = validation.errors;
            throw error;
        }

        return await projectRepository.submitForReview(projectId, userId);
    }

    async deleteProject(projectId, userId) {
        const result = await projectRepository.softDelete(projectId, userId);
        if (!result) throw new Error("PROYECTO_NO_ENCONTRADO");
        return result;
    }

    async getProjectDonations(projectId) {
        return await projectRepository.getProjectDonations(projectId);
    }

    async addImage(projectId, fileData) {
        return await projectRepository.saveImage({
            project_id: projectId,
            image_path: fileData.filename,
            original_filename: fileData.originalname,
            is_cover: false
        });
    }

    async deleteImage(imageId, projectId) {
        // Obtenemos imagen borrada para devolver path y que controller pueda eliminar archivo físico si desea (o service hacerlo)
        // El controller actualmente espera éxito y elimina archivo si repository devolvía data.
        // Repository modificado retorna: { image_path ... }
        return await projectRepository.deleteImage(imageId, projectId);
    }

    async updateCoverImage(projectId, fileData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const oldCover = await projectRepository.getCoverImage(projectId, client);

            // Cleanup covers previos
            await projectRepository.updateImagesStatus(projectId, { is_cover: false }, { project_id: projectId }, client);

            const newCover = await projectRepository.saveImage({
                project_id: projectId,
                image_path: fileData.filename,
                original_filename: fileData.originalname,
                is_cover: true
            }, client);

            await client.query('COMMIT');
            return { updated: newCover, oldPath: oldCover ? oldCover.image_path : null };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateRequirementFile(projectId, requirementId, fileData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const oldAnswer = await projectRepository.getRequirementAnswer(projectId, requirementId, client);

            if (oldAnswer) {
                await projectRepository.deleteRequirementAnswer(projectId, requirementId, client);
            }

            const newAnswer = await projectRepository.saveDocument({
                project_id: projectId,
                requirement_id: requirementId,
                file_path: fileData.filename,
                original_filename: fileData.original_filename,
                mime_type: fileData.mime_type || fileData.mimetype
            }, client);

            await client.query('COMMIT');
            return { updated: newAnswer, oldPath: oldAnswer ? oldAnswer.file_path : null };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new ProjectService();

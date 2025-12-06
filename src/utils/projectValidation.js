/**
 * Validates if a project is complete and ready for submission
 * @param {Object} project - The project object
 * @param {Array} images - List of project images
 * @param {Array} requirements - Expected requirements for the category
 * @param {Array} answers - Submitted answers/files
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validateProjectCompleteness = (project, images, requirements, answers) => {
    const errors = [];

    // 1. Basic Data Validation
    if (!project.title || project.title.trim() === '') {
        errors.push('El título es obligatorio');
    }

    if (!project.short_description || project.short_description.trim() === '') {
        errors.push('La descripción corta es obligatoria');
    }

    // Story Validation (JSON check)
    if (!project.story_json) {
        errors.push('La historia del proyecto es obligatoria');
    } else {
        const story = typeof project.story_json === 'string'
            ? JSON.parse(project.story_json)
            : project.story_json;

        // Editor.js usually has "blocks" array
        if (!story.blocks || story.blocks.length === 0) {
            errors.push('La historia del proyecto no puede estar vacía');
        }
    }

    // Financial Validation
    if (!project.goal_amount || parseFloat(project.goal_amount) <= 0) {
        errors.push('La meta de financiación debe ser mayor a 0');
    }

    if (!project.deadline_at) {
        errors.push('La fecha límite es obligatoria');
    } else {
        const deadline = new Date(project.deadline_at);
        const now = new Date();
        if (deadline <= now) {
            errors.push('La fecha límite debe ser futura');
        }
    }

    // 2. Multimedia Validation
    const hasCover = images.some(img => img.is_cover);
    if (!hasCover) {
        errors.push('El proyecto debe tener una imagen de portada');
    }

    // 3. Requirements Validation
    if (requirements && requirements.length > 0) {
        const requiredReqs = requirements.filter(r => r.is_required);

        requiredReqs.forEach(req => {
            const hasAnswer = answers.some(ans => ans.requirement_id === req.id);
            if (!hasAnswer) {
                errors.push(`Falta el requisito obligatorio: ${req.title}`);
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateProjectCompleteness
};

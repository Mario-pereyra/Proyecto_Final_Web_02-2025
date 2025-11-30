const projectDonationRepository = require("../repositories/projectDonationRepository");

exports.getProjectDonations = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido"
      });
    }

    const donations = await projectDonationRepository.getProjectDonations(projectId);

    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error("Error al obtener donaciones del proyecto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener donaciones del proyecto"
    });
  }
};

// Utility functions for position-specific form handling

const getFormKeysForPosition = (positionType) => {
  const baseFormKeys = [
    "personalInformation",
    "professionalExperience", 
    "workExperience",
    "education",
    "references",
    "legalDisclosures",
    "positionType",
    "employmentApplication",
    "orientationPresentation",
    "w4Form",
    "w9Form", 
    "i9Form",
    "emergencyContact",
    "directDeposit",
    "misconductStatement",
    "codeOfEthics",
    "serviceDeliveryPolicy",
    "nonCompeteAgreement",
    "backgroundCheck",
    "tbSymptomScreen",
    "orientationChecklist",
  ];

  // Add position-specific forms
  switch (positionType) {
    case 'PCA':
      return [...baseFormKeys, "jobDescriptionPCA", "pcaTrainingQuestions"];
    case 'CNA':
      return [...baseFormKeys, "jobDescriptionCNA"];
    case 'LPN':
      return [...baseFormKeys, "jobDescriptionLPN"];
    case 'RN':
      return [...baseFormKeys, "jobDescriptionRN"];
    default:
      return baseFormKeys;
  }
};

const getRelevantJobDescriptionForms = (positionType) => {
  switch (positionType) {
    case 'PCA':
      return ['jobDescriptionPCA'];
    case 'CNA':
      return ['jobDescriptionCNA'];
    case 'LPN':
      return ['jobDescriptionLPN'];
    case 'RN':
      return ['jobDescriptionRN'];
    default:
      return [];
  }
};

module.exports = {
  getFormKeysForPosition,
  getRelevantJobDescriptionForms
};
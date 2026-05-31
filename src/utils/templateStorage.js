// Storage key for saved task templates
const TEMPLATE_KEY = "saved-task-templates";

// Read all saved templates
export function getTemplates() {
  return JSON.parse(localStorage.getItem(TEMPLATE_KEY)) || [];
}

// Persist template data to localStorage
export function saveTemplates(templates) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

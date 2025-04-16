import clinicallyUsefulJournals from "../../data/clinically-useful-journals.json";
import cardiologyJournals from "../../data/cardiology-journals.json";
import internalMedicineJournals from "../../data/internal-medicine-journals.json";

// Export the journal arrays
export const CLINICALLY_USEFUL_JOURNALS = clinicallyUsefulJournals.journals;
export const CARDIOLOGY_JOURNALS = cardiologyJournals.journals;
export const INTERNAL_MEDICINE_JOURNALS = internalMedicineJournals.journals;

/**
 * Creates a PubMed filter string from an array of journal names
 * Uses Automatic Term Mapping (ATM) by not adding field tags
 * @param journals Array of journal names
 * @returns Formatted filter string for use in PubMed queries
 */
export function createJournalFilter(journals: string[]): string {
  return `(${journals.map((journal) => `"${journal}"`).join(" OR ")})`;
}

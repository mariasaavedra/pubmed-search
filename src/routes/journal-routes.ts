import express from "express";
import JournalController from "../controllers/journal-controller";

const router = express.Router();

// Initialize the controller
JournalController.initialize();

// Journal database endpoints
router.get("/api/journals", JournalController.getAllJournals);
router.get("/api/journals/search", JournalController.searchJournals);
router.get("/api/journals/specialty/:specialty", JournalController.getJournalsBySpecialty);
router.get("/api/journals/specialties", JournalController.getSpecialties);
router.get("/api/journals/filter/:specialty", JournalController.getJournalFilter);
router.get("/api/journals/issn/:issn", JournalController.findJournalByISSN);

// NLM Catalog endpoints
router.get("/api/nlm/search", JournalController.searchNLMCatalog);

// Management endpoints (protected)
router.post("/api/journals/update", JournalController.updateJournalDatabase);
router.post("/api/journals/map-specialty", JournalController.mapJournalsToSpecialty);

export default router;

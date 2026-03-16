package com.example.backend_syndic.config;

import com.example.backend_syndic.Dao.*;
import com.example.backend_syndic.entity.*;
import com.example.backend_syndic.enums.ChargeType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Date;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ImmeubleRepository immeubleRepository;
    private final AppartementRepository appartementRepository;
    private final ChargeRepository chargeRepository;
    private final AppelChargeRepository appelChargeRepository;
    private final PaiementRepository paiementRepository;
    private final StatusRepository statusRepository;
    private final ActivityLogRepository activityLogRepository;

    public DataSeeder(UserRepository u, ImmeubleRepository i, AppartementRepository a,
            ChargeRepository c, AppelChargeRepository ac, PaiementRepository p,
            StatusRepository s, ActivityLogRepository al) {
        this.userRepository = u;
        this.immeubleRepository = i;
        this.appartementRepository = a;
        this.chargeRepository = c;
        this.appelChargeRepository = ac;
        this.paiementRepository = p;
        this.statusRepository = s;
        this.activityLogRepository = al;
    }

    @Override
    public void run(String... args) throws Exception {
        // ALWAYS check for superadmin regardless of other data
        if (userRepository.findByEmail("superadmin@easysyndic.ma").isEmpty()) {
            User superAdmin = new User();
            superAdmin.setNom("System");
            superAdmin.setPrenom("SuperAdmin");
            superAdmin.setEmail("superadmin@easysyndic.ma");
            superAdmin.setMotDePasse("super");
            superAdmin.setRole(User.Role.SUPERADMIN);
            superAdmin.setActive(true);
            userRepository.save(superAdmin);
            System.out.println(">>> User SUPERADMIN created successfully!");
        }

        if (userRepository.findByEmail("admin@easysyndic.ma").isPresent()) {
            System.out.println("Base de données déjà initialisée avec les données de test.");
            return;
        }

        System.out.println("Création de données de test en cours...");

        // ═══════════════════════════════════════════════════════════════
        // 1. STATUTS
        // ═══════════════════════════════════════════════════════════════
        Status paye = statusRepository.findByLabel("PAYÉ")
                .orElseGet(() -> statusRepository.save(new Status(null, "PAYÉ")));
        Status enRetard = statusRepository.findByLabel("EN_RETARD")
                .orElseGet(() -> statusRepository.save(new Status(null, "EN_RETARD")));
        Status enAttente = statusRepository.findByLabel("EN_ATTENTE")
                .orElseGet(() -> statusRepository.save(new Status(null, "EN_ATTENTE")));

        // ═══════════════════════════════════════════════════════════════
        // 2. UTILISATEURS (2 Admins/Syndics + 8 Propriétaires + 2 Locataires)
        // ═══════════════════════════════════════════════════════════════
        User admin = createUser("Admin", "Super", "admin@easysyndic.ma", "admin123", User.Role.ADMIN);
        User syndic2 = createUser("Lahlou", "Karim", "syndic2@easysyndic.ma", "password", User.Role.ADMIN);

        User prop1 = createUser("Benali", "Ahmed", "ahmed.benali@example.com", "password", User.Role.PROPRIETAIRE);
        User prop2 = createUser("El Fassi", "Sara", "sara.elfassi@example.com", "password", User.Role.PROPRIETAIRE);
        User prop3 = createUser("Tazi", "Mohammed", "mohammed.tazi@example.com", "password", User.Role.PROPRIETAIRE);
        User prop4 = createUser("Chraibi", "Fatima", "fatima.chraibi@example.com", "password", User.Role.PROPRIETAIRE);
        User prop5 = createUser("Bennani", "Youssef", "youssef.bennani@example.com", "password", User.Role.PROPRIETAIRE);
        User prop6 = createUser("Alaoui", "Khadija", "khadija.alaoui@example.com", "password", User.Role.PROPRIETAIRE);
        User prop7 = createUser("Idrissi", "Omar", "omar.idrissi@example.com", "password", User.Role.PROPRIETAIRE);
        User prop8 = createUser("Filali", "Amina", "amina.filali@example.com", "password", User.Role.PROPRIETAIRE);

        User loc1 = createUser("Ouazzani", "Hassan", "hassan.ouazzani@example.com", "password", User.Role.LOCATAIRE);
        User loc2 = createUser("Berrada", "Nadia", "nadia.berrada@example.com", "password", User.Role.LOCATAIRE);

        // ═══════════════════════════════════════════════════════════════
        // 3. IMMEUBLES (5 buildings across Moroccan cities)
        // ═══════════════════════════════════════════════════════════════
        Immeuble immA = createImmeuble("Résidence Atlas", "123 Boulevard Hassan II, Casablanca", 6, 18, 6, admin);
        Immeuble immB = createImmeuble("Résidence Océan", "45 Avenue de la Corniche, Rabat", 8, 24, 5, admin);
        Immeuble immC = createImmeuble("Résidence Majorelle", "78 Rue Yves Saint Laurent, Marrakech", 4, 12, 4, syndic2);
        Immeuble immD = createImmeuble("Résidence Rif", "12 Boulevard Mohammed V, Tanger", 5, 15, 3, syndic2);
        Immeuble immE = createImmeuble("Résidence Saiss", "34 Avenue des FAR, Fès", 3, 9, 2, admin);

        // ═══════════════════════════════════════════════════════════════
        // 4. APPARTEMENTS (20 apartments spread across buildings)
        // ═══════════════════════════════════════════════════════════════

        // -- Résidence Atlas (6 appts) --
        Appartement a101 = createAppartement("A101", 1, 75.0, immA, prop1, null);
        Appartement a102 = createAppartement("A102", 1, 85.0, immA, prop2, null);
        Appartement a201 = createAppartement("A201", 2, 90.0, immA, prop3, null);
        Appartement a202 = createAppartement("A202", 2, 110.0, immA, prop4, null);
        Appartement a301 = createAppartement("A301", 3, 120.0, immA, prop5, loc1);
        Appartement a302 = createAppartement("A302", 3, 65.0, immA, null, null); // vacant

        // -- Résidence Océan (5 appts) --
        Appartement b101 = createAppartement("B101", 1, 95.0, immB, prop6, null);
        Appartement b102 = createAppartement("B102", 1, 80.0, immB, prop7, null);
        Appartement b201 = createAppartement("B201", 2, 100.0, immB, prop8, null);
        Appartement b301 = createAppartement("B301", 3, 115.0, immB, prop1, loc2);
        Appartement b401 = createAppartement("B401", 4, 70.0, immB, null, null); // vacant

        // -- Résidence Majorelle (4 appts) --
        Appartement c101 = createAppartement("C101", 1, 88.0, immC, prop2, null);
        Appartement c102 = createAppartement("C102", 1, 92.0, immC, prop3, null);
        Appartement c201 = createAppartement("C201", 2, 105.0, immC, prop4, null);
        Appartement c202 = createAppartement("C202", 2, 78.0, immC, prop5, null);

        // -- Résidence Rif (3 appts) --
        Appartement d101 = createAppartement("D101", 1, 82.0, immD, prop6, null);
        Appartement d201 = createAppartement("D201", 2, 96.0, immD, prop7, null);
        Appartement d301 = createAppartement("D301", 3, 110.0, immD, prop8, null);

        // -- Résidence Saiss (2 appts) --
        Appartement e101 = createAppartement("E101", 1, 70.0, immE, prop1, null);
        Appartement e201 = createAppartement("E201", 2, 85.0, immE, prop2, null);

        // ═══════════════════════════════════════════════════════════════
        // 5. CHARGES (diverse charges across buildings)
        // ═══════════════════════════════════════════════════════════════

        // -- Résidence Atlas charges --
        Charge chNettoyageA = createCharge("Nettoyage Mensuel", ChargeType.MONTHLY, 600.0, "Mois", true, immA);
        Charge chAscenseurA = createCharge("Entretien Ascenseur", ChargeType.MONTHLY, 1500.0, "Trimestre", true, immA);
        Charge chSecuriteA = createCharge("Gardiennage et Sécurité", ChargeType.MONTHLY, 2000.0, "Mois", true, immA);
        Charge chReparationA = createCharge("Réparation Toiture", ChargeType.EXCEPTIONNEL, 8000.0, "Unique", false, immA);

        // -- Résidence Océan charges --
        Charge chNettoyageB = createCharge("Nettoyage Mensuel", ChargeType.MONTHLY, 500.0, "Mois", true, immB);
        Charge chEauB = createCharge("Eau Parties Communes", ChargeType.MONTHLY, 350.0, "Mois", true, immB);
        Charge chJardinB = createCharge("Entretien Jardin", ChargeType.MONTHLY, 800.0, "Mois", true, immB);
        Charge chPeintureB = createCharge("Peinture Cage d'Escalier", ChargeType.SPECIAL, 5000.0, "Unique", false, immB);

        // -- Résidence Majorelle charges --
        Charge chNettoyageC = createCharge("Nettoyage Mensuel", ChargeType.MONTHLY, 450.0, "Mois", true, immC);
        Charge chPiscineC = createCharge("Entretien Piscine", ChargeType.MONTHLY, 1200.0, "Mois", true, immC);
        Charge chElectriciteC = createCharge("Électricité Parties Communes", ChargeType.MONTHLY, 700.0, "Mois", true, immC);

        // -- Résidence Rif charges --
        Charge chNettoyageD = createCharge("Nettoyage Mensuel", ChargeType.MONTHLY, 400.0, "Mois", true, immD);
        Charge chInterphoneD = createCharge("Réparation Interphone", ChargeType.EXCEPTIONNEL, 3000.0, "Unique", false, immD);

        // -- Résidence Saiss charges --
        Charge chNettoyageE = createCharge("Nettoyage Mensuel", ChargeType.MONTHLY, 350.0, "Mois", true, immE);
        Charge chEauE = createCharge("Eau Parties Communes", ChargeType.MONTHLY, 250.0, "Mois", true, immE);

        // ═══════════════════════════════════════════════════════════════
        // 6. APPELS DE CHARGES (distributed to apartments)
        // ═══════════════════════════════════════════════════════════════

        // -- Atlas: Nettoyage (600 MAD / 6 appts = 100 MAD each) --
        AppelCharge ac1 = createAppelCharge(a101, chNettoyageA, 100.0, paye);
        AppelCharge ac2 = createAppelCharge(a102, chNettoyageA, 100.0, paye);
        AppelCharge ac3 = createAppelCharge(a201, chNettoyageA, 100.0, enRetard);
        AppelCharge ac4 = createAppelCharge(a202, chNettoyageA, 100.0, enAttente);
        AppelCharge ac5 = createAppelCharge(a301, chNettoyageA, 100.0, paye);
        AppelCharge ac6 = createAppelCharge(a302, chNettoyageA, 100.0, enAttente);

        // -- Atlas: Ascenseur (1500 / 6 = 250 MAD each) --
        AppelCharge ac7 = createAppelCharge(a101, chAscenseurA, 250.0, paye);
        AppelCharge ac8 = createAppelCharge(a102, chAscenseurA, 250.0, enRetard);
        AppelCharge ac9 = createAppelCharge(a201, chAscenseurA, 250.0, enRetard);
        AppelCharge ac10 = createAppelCharge(a202, chAscenseurA, 250.0, paye);

        // -- Atlas: Sécurité (2000 / 6 ≈ 333.33 MAD each) --
        AppelCharge ac13 = createAppelCharge(a101, chSecuriteA, 333.33, paye);
        AppelCharge ac14 = createAppelCharge(a102, chSecuriteA, 333.33, paye);
        AppelCharge ac15 = createAppelCharge(a201, chSecuriteA, 333.33, enRetard);
        AppelCharge ac16 = createAppelCharge(a202, chSecuriteA, 333.33, enAttente);

        // -- Atlas: Réparation Toiture (8000 / 6 ≈ 1333.33 each) --
        AppelCharge ac17 = createAppelCharge(a101, chReparationA, 1333.33, enAttente);
        AppelCharge ac18 = createAppelCharge(a102, chReparationA, 1333.33, enAttente);
        AppelCharge ac19 = createAppelCharge(a201, chReparationA, 1333.33, enRetard);

        // -- Océan: Nettoyage (500 / 5 = 100 MAD each) --
        AppelCharge ac20 = createAppelCharge(b101, chNettoyageB, 100.0, paye);
        AppelCharge ac21 = createAppelCharge(b102, chNettoyageB, 100.0, paye);
        AppelCharge ac22 = createAppelCharge(b201, chNettoyageB, 100.0, enRetard);
        AppelCharge ac23 = createAppelCharge(b301, chNettoyageB, 100.0, paye);
        AppelCharge ac24 = createAppelCharge(b401, chNettoyageB, 100.0, enAttente);

        // -- Océan: Eau (350 / 5 = 70 MAD each) --
        AppelCharge ac25 = createAppelCharge(b101, chEauB, 70.0, paye);
        AppelCharge ac26 = createAppelCharge(b102, chEauB, 70.0, enRetard);
        AppelCharge ac27 = createAppelCharge(b201, chEauB, 70.0, paye);
        AppelCharge ac28 = createAppelCharge(b301, chEauB, 70.0, enAttente);

        // -- Océan: Peinture (5000 / 5 = 1000 MAD each) --
        AppelCharge ac29 = createAppelCharge(b101, chPeintureB, 1000.0, enAttente);
        AppelCharge ac30 = createAppelCharge(b102, chPeintureB, 1000.0, enRetard);

        // -- Majorelle: Nettoyage (450 / 4 = 112.5 MAD each) --
        AppelCharge ac31 = createAppelCharge(c101, chNettoyageC, 112.5, paye);
        AppelCharge ac32 = createAppelCharge(c102, chNettoyageC, 112.5, paye);
        AppelCharge ac33 = createAppelCharge(c201, chNettoyageC, 112.5, enRetard);
        AppelCharge ac34 = createAppelCharge(c202, chNettoyageC, 112.5, enAttente);

        // -- Majorelle: Piscine (1200 / 4 = 300 MAD each) --
        AppelCharge ac35 = createAppelCharge(c101, chPiscineC, 300.0, paye);
        AppelCharge ac36 = createAppelCharge(c102, chPiscineC, 300.0, enRetard);
        AppelCharge ac37 = createAppelCharge(c201, chPiscineC, 300.0, paye);
        AppelCharge ac38 = createAppelCharge(c202, chPiscineC, 300.0, enAttente);

        // -- Rif: Nettoyage (400 / 3 ≈ 133.33 MAD each) --
        AppelCharge ac39 = createAppelCharge(d101, chNettoyageD, 133.33, paye);
        AppelCharge ac40 = createAppelCharge(d201, chNettoyageD, 133.33, enRetard);
        AppelCharge ac41 = createAppelCharge(d301, chNettoyageD, 133.33, paye);

        // -- Rif: Interphone (3000 / 3 = 1000 MAD each) --
        AppelCharge ac42 = createAppelCharge(d101, chInterphoneD, 1000.0, enAttente);
        AppelCharge ac43 = createAppelCharge(d201, chInterphoneD, 1000.0, enRetard);

        // -- Saiss: Nettoyage (350 / 2 = 175 MAD each) --
        AppelCharge ac44 = createAppelCharge(e101, chNettoyageE, 175.0, paye);
        AppelCharge ac45 = createAppelCharge(e201, chNettoyageE, 175.0, enRetard);

        // -- Saiss: Eau (250 / 2 = 125 MAD each) --
        AppelCharge ac46 = createAppelCharge(e101, chEauE, 125.0, paye);
        AppelCharge ac47 = createAppelCharge(e201, chEauE, 125.0, enAttente);

        // ═══════════════════════════════════════════════════════════════
        // 7. PAIEMENTS (for all PAYÉ appel charges)
        // ═══════════════════════════════════════════════════════════════

        // Atlas payments
        createPaiement(a101, prop1, ac1, 100.0, LocalDate.of(2026, 1, 5), "VIREMENT", "VIR-2026-001");
        createPaiement(a102, prop2, ac2, 100.0, LocalDate.of(2026, 1, 8), "ESPECE", "ESP-2026-002");
        createPaiement(a301, prop5, ac5, 100.0, LocalDate.of(2026, 1, 12), "CHEQUE", "CHQ-2026-003");
        createPaiement(a101, prop1, ac7, 250.0, LocalDate.of(2026, 1, 15), "VIREMENT", "VIR-2026-004");
        createPaiement(a202, prop4, ac10, 250.0, LocalDate.of(2026, 1, 18), "CARTE", "CRT-2026-005");
        createPaiement(a101, prop1, ac13, 333.33, LocalDate.of(2026, 2, 1), "VIREMENT", "VIR-2026-006");
        createPaiement(a102, prop2, ac14, 333.33, LocalDate.of(2026, 2, 3), "ESPECE", "ESP-2026-007");

        // Océan payments
        createPaiement(b101, prop6, ac20, 100.0, LocalDate.of(2026, 1, 10), "VIREMENT", "VIR-2026-008");
        createPaiement(b102, prop7, ac21, 100.0, LocalDate.of(2026, 1, 11), "ESPECE", "ESP-2026-009");
        createPaiement(b301, prop1, ac23, 100.0, LocalDate.of(2026, 1, 20), "CHEQUE", "CHQ-2026-010");
        createPaiement(b101, prop6, ac25, 70.0, LocalDate.of(2026, 2, 5), "VIREMENT", "VIR-2026-011");
        createPaiement(b201, prop8, ac27, 70.0, LocalDate.of(2026, 2, 8), "CARTE", "CRT-2026-012");

        // Majorelle payments
        createPaiement(c101, prop2, ac31, 112.5, LocalDate.of(2026, 1, 14), "ESPECE", "ESP-2026-013");
        createPaiement(c102, prop3, ac32, 112.5, LocalDate.of(2026, 1, 16), "VIREMENT", "VIR-2026-014");
        createPaiement(c101, prop2, ac35, 300.0, LocalDate.of(2026, 2, 10), "CHEQUE", "CHQ-2026-015");
        createPaiement(c201, prop4, ac37, 300.0, LocalDate.of(2026, 2, 12), "VIREMENT", "VIR-2026-016");

        // Rif payments
        createPaiement(d101, prop6, ac39, 133.33, LocalDate.of(2026, 1, 22), "ESPECE", "ESP-2026-017");
        createPaiement(d301, prop8, ac41, 133.33, LocalDate.of(2026, 1, 25), "VIREMENT", "VIR-2026-018");

        // Saiss payments
        createPaiement(e101, prop1, ac44, 175.0, LocalDate.of(2026, 2, 1), "CARTE", "CRT-2026-019");
        createPaiement(e101, prop1, ac46, 125.0, LocalDate.of(2026, 2, 15), "VIREMENT", "VIR-2026-020");

        // ═══════════════════════════════════════════════════════════════
        // 8. ACTIVITY LOGS
        // ═══════════════════════════════════════════════════════════════
        activityLogRepository.save(new ActivityLog("CREATE", "USER", "Création du compte admin principal", "System"));
        activityLogRepository.save(new ActivityLog("CREATE", "IMMEUBLE", "Ajout de Résidence Atlas à Casablanca", "admin@easysyndic.ma"));
        activityLogRepository.save(new ActivityLog("CREATE", "IMMEUBLE", "Ajout de Résidence Océan à Rabat", "admin@easysyndic.ma"));
        activityLogRepository.save(new ActivityLog("CREATE", "IMMEUBLE", "Ajout de Résidence Majorelle à Marrakech", "syndic2@easysyndic.ma"));
        activityLogRepository.save(new ActivityLog("CREATE", "IMMEUBLE", "Ajout de Résidence Rif à Tanger", "syndic2@easysyndic.ma"));
        activityLogRepository.save(new ActivityLog("CREATE", "PAIEMENT", "Paiement de 100.0 MAD par Ahmed Benali - Nettoyage Mensuel", "ahmed.benali@example.com"));
        activityLogRepository.save(new ActivityLog("CREATE", "PAIEMENT", "Paiement de 250.0 MAD par Ahmed Benali - Entretien Ascenseur", "ahmed.benali@example.com"));
        activityLogRepository.save(new ActivityLog("UPDATE", "CHARGE", "Distribution de la charge Nettoyage Mensuel aux appartements", "admin@easysyndic.ma"));
        activityLogRepository.save(new ActivityLog("CREATE", "PAIEMENT", "Paiement de 300.0 MAD par Sara El Fassi - Entretien Piscine", "sara.elfassi@example.com"));
        activityLogRepository.save(new ActivityLog("UPDATE", "USER", "Désactivation du compte de Hassan Ouazzani", "admin@easysyndic.ma"));

        System.out.println("════════════════════════════════════════════════════════");
        System.out.println("  Mock data initialisée avec succès !");
        System.out.println("  - 12 utilisateurs (1 superadmin, 2 admins, 8 propriétaires, 2 locataires)");
        System.out.println("  - 5 immeubles");
        System.out.println("  - 20 appartements");
        System.out.println("  - 15 charges");
        System.out.println("  - 47 appels de charges");
        System.out.println("  - 20 paiements");
        System.out.println("  - 10 activity logs");
        System.out.println("════════════════════════════════════════════════════════");
    }

    // ─── Helper methods ────────────────────────────────────────────────

    private User createUser(String nom, String prenom, String email, String mdp, User.Role role) {
        User u = new User();
        u.setNom(nom);
        u.setPrenom(prenom);
        u.setEmail(email);
        u.setMotDePasse(mdp);
        u.setRole(role);
        u.setActive(true);
        return userRepository.save(u);
    }

    private Immeuble createImmeuble(String nom, String adress, int etages, int maxAppts, int nbAppts, User syndic) {
        Immeuble imm = new Immeuble();
        imm.setNom(nom);
        imm.setAdress(adress);
        imm.setNombreEtages(etages);
        imm.setNombreAppartementsMax(maxAppts);
        imm.setNombreAppartement(nbAppts);
        imm.setSyndic(syndic);
        return immeubleRepository.save(imm);
    }

    private Appartement createAppartement(String numero, int etage, double surface,
            Immeuble immeuble, User proprietaire, User locataire) {
        Appartement a = new Appartement();
        a.setNumero(numero);
        a.setEtage(etage);
        a.setSurface(surface);
        a.setImmeuble(immeuble);
        a.setProprietaire(proprietaire);
        a.setLocataire(locataire);
        return appartementRepository.save(a);
    }

    private Charge createCharge(String type, ChargeType chargeType, double montant,
            String periode, boolean recurring, Immeuble immeuble) {
        Charge c = new Charge();
        c.setType(type);
        c.setChargeType(chargeType);
        c.setMontant(montant);
        c.setPeriode(periode);
        c.setIsRecurring(recurring);
        c.setImmeuble(immeuble);
        return chargeRepository.save(c);
    }

    private AppelCharge createAppelCharge(Appartement appt, Charge charge, double total, Status status) {
        AppelCharge ac = new AppelCharge();
        ac.setAppartement(appt);
        ac.setCharge(charge);
        ac.setDateEmission(new Date());
        ac.setTotal(total);
        ac.setStatus(status);
        ac.setReminderSent(false);
        return appelChargeRepository.save(ac);
    }

    private void createPaiement(Appartement appt, User user, AppelCharge appelCharge,
            double montant, LocalDate date, String mode, String reference) {
        Paiement p = new Paiement();
        p.setAppartement(appt);
        p.setUser(user);
        p.setAppelCharge(appelCharge);
        p.setMontant(montant);
        p.setDatePaiement(date);
        p.setModePaiement(mode);
        p.setReference(reference);
        paiementRepository.save(p);
    }
}

package com.example.backend_syndic.config;

import com.example.backend_syndic.Dao.*;
import com.example.backend_syndic.entity.*;
import com.example.backend_syndic.enums.ChargeType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ImmeubleRepository immeubleRepository;
    private final AppartementRepository appartementRepository;
    private final ChargeRepository chargeRepository;
    private final AppelChargeRepository appelChargeRepository;
    private final PaiementRepository paiementRepository;
    private final StatusRepository statusRepository;

    public DataSeeder(UserRepository u, ImmeubleRepository i, AppartementRepository a,
            ChargeRepository c, AppelChargeRepository ac, PaiementRepository p, StatusRepository s) {
        this.userRepository = u;
        this.immeubleRepository = i;
        this.appartementRepository = a;
        this.chargeRepository = c;
        this.appelChargeRepository = ac;
        this.paiementRepository = p;
        this.statusRepository = s;
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

        // 1. Statuses
        Status paye = statusRepository.findByLabel("PAYÉ")
                .orElseGet(() -> statusRepository.save(new Status(null, "PAYÉ")));
        Status enRetard = statusRepository.findByLabel("EN_RETARD")
                .orElseGet(() -> statusRepository.save(new Status(null, "EN_RETARD")));
        Status enAttente = statusRepository.findByLabel("EN_ATTENTE")
                .orElseGet(() -> statusRepository.save(new Status(null, "EN_ATTENTE")));

        // 2. Users
        User admin = new User();
        admin.setNom("Admin");
        admin.setPrenom("Super");
        admin.setEmail("admin@easysyndic.ma");
        admin.setMotDePasse("admin123");
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);
        admin = userRepository.save(admin);

        User admin2 = new User();
        admin2.setNom("Lahlou");
        admin2.setPrenom("Karim");
        admin2.setEmail("syndic2@easysyndic.ma");
        admin2.setMotDePasse("password");
        admin2.setRole(User.Role.ADMIN);
        admin2.setActive(true);
        admin2 = userRepository.save(admin2);

        User prop1 = new User();
        prop1.setNom("Benali");
        prop1.setPrenom("Ahmed");
        prop1.setEmail("ahmed.benali@example.com");
        prop1.setMotDePasse("password");
        prop1.setRole(User.Role.PROPRIETAIRE);
        prop1.setActive(true);
        prop1 = userRepository.save(prop1);

        User prop2 = new User();
        prop2.setNom("Lahlou");
        prop2.setPrenom("Sara");
        prop2.setEmail("sara.lahlou@example.com");
        prop2.setMotDePasse("password");
        prop2.setRole(User.Role.PROPRIETAIRE);
        prop2.setActive(true);
        prop2 = userRepository.save(prop2);

        // 3. Immeubles
        Immeuble immA = new Immeuble();
        immA.setNom("Immeuble Atlas");
        immA.setAdress("123 Boulevard Hassan II, Casablanca");
        immA.setNombreEtages(5);
        immA.setNombreAppartementsMax(15);
        immA.setNombreAppartement(2); // manually set as per dummy data
        immA.setSyndic(admin);
        immA = immeubleRepository.save(immA);

        Immeuble immB = new Immeuble();
        immB.setNom("Résidence Océan");
        immB.setAdress("45 Corniche, Rabat");
        immB.setNombreEtages(8);
        immB.setNombreAppartementsMax(30);
        immB.setNombreAppartement(1);
        immB.setSyndic(admin2);
        immB = immeubleRepository.save(immB);

        // 4. Appartements
        Appartement appt1 = new Appartement();
        appt1.setNumero("A101");
        appt1.setEtage(1);
        appt1.setSurface(80.0);
        appt1.setImmeuble(immA);
        appt1.setProprietaire(prop1);
        appt1 = appartementRepository.save(appt1);

        Appartement appt2 = new Appartement();
        appt2.setNumero("A203"); // specific question from prompt
        appt2.setEtage(2);
        appt2.setSurface(120.0);
        appt2.setImmeuble(immA);
        appt2.setProprietaire(prop2);
        appt2 = appartementRepository.save(appt2);

        Appartement appt3 = new Appartement();
        appt3.setNumero("B101");
        appt3.setEtage(1);
        appt3.setSurface(90.0);
        appt3.setImmeuble(immB);
        // Empty apartment (no proprietaire)
        appt3 = appartementRepository.save(appt3);

        // 5. Charges
        Charge chargeCommune = new Charge();
        chargeCommune.setType("Nettoyage Mensuel");
        chargeCommune.setChargeType(ChargeType.MONTHLY);
        chargeCommune.setMontant(500.0);
        chargeCommune.setPeriode("Mois");
        chargeCommune.setIsRecurring(true);
        chargeCommune.setImmeuble(immA);
        chargeCommune = chargeRepository.save(chargeCommune);

        Charge chargeAscenseur = new Charge();
        chargeAscenseur.setType("Entretien Ascenseur");
        chargeAscenseur.setChargeType(ChargeType.MONTHLY);
        chargeAscenseur.setMontant(1200.0);
        chargeAscenseur.setPeriode("Trimestre");
        chargeAscenseur.setIsRecurring(true);
        chargeAscenseur.setImmeuble(immA);
        chargeAscenseur = chargeRepository.save(chargeAscenseur);

        // 6. Appel Charges
        AppelCharge appel1 = new AppelCharge();
        appel1.setAppartement(appt1);
        appel1.setCharge(chargeCommune);
        appel1.setDateEmission(new Date());
        appel1.setStatus(paye);
        appel1.setTotal(250.0); // partial amount based on distribution maybe
        appel1 = appelChargeRepository.save(appel1);

        AppelCharge appel2 = new AppelCharge();
        appel2.setAppartement(appt2);
        appel2.setCharge(chargeCommune);
        appel2.setDateEmission(new Date());
        appel2.setStatus(enRetard);
        appel2.setTotal(250.0);
        appel2 = appelChargeRepository.save(appel2);

        AppelCharge appel3 = new AppelCharge();
        appel3.setAppartement(appt2);
        appel3.setCharge(chargeAscenseur);
        appel3.setDateEmission(new Date());
        appel3.setStatus(enAttente);
        appel3.setTotal(600.0);
        appel3 = appelChargeRepository.save(appel3);

        // 7. Paiements
        Paiement paiement1 = new Paiement();
        paiement1.setAppartement(appt1);
        paiement1.setUser(prop1);
        paiement1.setAppelCharge(appel1);
        paiement1.setMontant(250.0);
        paiement1.setDatePaiement(LocalDate.now());
        paiement1.setModePaiement("VIREMENT");
        paiement1.setReference("VIR-12345");
        paiementRepository.save(paiement1);

        System.out.println("Données de test initialisées avec succès !");
    }
}

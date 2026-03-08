/**
 * buildingData.ts
 * ─────────────────────────────────────────────────────
 * Formats ALL syndic data from the Redux store into a
 * comprehensive context string for the Groq AI prompt.
 *
 * Two modes:
 *  - ADMIN: sees everything (all buildings, owners, charges, payments)
 *  - PROPRIETAIRE: sees only their own data
 */

export interface PaiementInfo {
    id: string;
    montant: number;
    datePaiement?: string;
    modePaiement?: string;
    appartement?: { id: string; numero: string };
    proprietaire?: { id: string; nom: string; prenom: string };
    appelCharge?: { id: string };
}

/**
 * Generates ADMIN context — full data across all buildings.
 */
export function formatAdminContext(
    buildings: any[],
    apartments: any[],
    charges: any[],
    appelCharges: any[],
    paiements: any[],
    users: any[]
): string {
    let ctx = '';

    // ── 1. Buildings overview ──
    ctx += `📋 IMMEUBLES GÉRÉS (${buildings.length} au total):\n`;
    buildings.forEach((b) => {
        const aptsInBuilding = apartments.filter(
            (a: any) => a.immeuble?.id === b.id
        );
        const vacants = aptsInBuilding.filter((a: any) => !a.proprietaire);
        ctx += `  • ID:${b.id} — "${b.nom}" — ${b.adress || b.adresse || 'N/A'} — ${b.nombreEtages || 0} étages — ${aptsInBuilding.length} appts (${vacants.length} libres)\n`;
    });

    // ── 2. Apartments detail ──
    ctx += `\n🏠 APPARTEMENTS (${apartments.length} au total):\n`;
    const vacantApts = apartments.filter((a: any) => !a.proprietaire);
    const occupiedApts = apartments.filter((a: any) => a.proprietaire);
    ctx += `  → ${occupiedApts.length} occupés, ${vacantApts.length} libres\n`;

    apartments.forEach((a: any) => {
        const aptNum = a.numero || a.nemuro || 'Inconnu';
        const buildingName = a.immeuble?.nom || 'Inconnu';
        const ownerInfo = a.proprietaire
            ? `${a.proprietaire.prenom} ${a.proprietaire.nom} (ID:${a.proprietaire.id})`
            : '🔓 LIBRE (pas de propriétaire)';
        ctx += `  • Appt "${aptNum}" — Étage ${a.etage} — ${a.surface} m² — Immeuble: ${buildingName} — Propriétaire: ${ownerInfo}\n`;
    });

    // ── 3. Proprietaires overview ──
    const proprietaires = users.filter((u: any) => {
        const role = String(u.role || '').toLowerCase();
        return role === 'proprietaire' || role === 'propreitaire';
    });
    ctx += `\n👥 PROPRIÉTAIRES ENREGISTRÉS (${proprietaires.length}):\n`;
    proprietaires.forEach((p: any) => {
        const ownedApts = apartments.filter(
            (a: any) => a.proprietaire?.id === p.id
        );
        const aptNums = ownedApts.map((a: any) => a.numero).join(', ') || 'Aucun';
        ctx += `  • ${p.prenom} ${p.nom} (ID:${p.id}) — Email: ${p.email} — Tél: ${p.telephone || 'N/A'} — Appartements: ${aptNums}\n`;
    });

    // ── 4. Charges detail ──
    ctx += `\n💰 CHARGES (${charges.length}):\n`;
    charges.forEach((c: any) => {
        const designation = c.designation || c.type || 'Charge';
        const buildingName = c.immeuble?.nom || 'N/A';
        const distributed = c.distributed ? '✅ Distribuée' : '⏳ Non distribuée';
        ctx += `  • "${designation}" — ${c.montant} MAD — Date: ${c.date || 'N/A'} — Immeuble: ${buildingName} — ${distributed}\n`;
    });

    // ── 5. Appels de Charges with payment status ──
    const unpaid = appelCharges.filter((ac: any) => ac.status?.label !== 'PAYÉ');
    const paid = appelCharges.filter((ac: any) => ac.status?.label === 'PAYÉ');
    ctx += `\n📊 APPELS DE CHARGES (${appelCharges.length} au total):\n`;
    ctx += `  → ${paid.length} payés ✅ | ${unpaid.length} impayés ❌\n`;

    appelCharges.forEach((ac: any) => {
        const aptNum = ac.appartement?.numero || '?';
        const chargeType = ac.charge?.type || ac.charge?.designation || 'Charge';
        const status = ac.status?.label || 'INCONNU';
        const statusIcon = status === 'PAYÉ' ? '✅' : status === 'EN_ATTENTE' ? '⏳' : '❌';
        ctx += `  • Appt ${aptNum} — "${chargeType}" — ${ac.total} MAD — Date: ${ac.dateEmission || 'N/A'} — ${statusIcon} ${status}\n`;
    });

    // ── 6. Paiements summary ──
    const totalPaid = paiements.reduce((s: number, p: any) => s + (p.montant || 0), 0);
    ctx += `\n💳 PAIEMENTS (${paiements.length} au total — ${totalPaid.toFixed(2)} MAD encaissés):\n`;

    // Group by proprietaire
    const paymentsByOwner: Record<string, any[]> = {};
    paiements.forEach((p: any) => {
        const ownerId = p.proprietaire?.id || p.appartement?.proprietaire?.id || 'unknown';
        const ownerName = p.proprietaire
            ? `${p.proprietaire.prenom} ${p.proprietaire.nom}`
            : 'Inconnu';
        if (!paymentsByOwner[ownerId]) paymentsByOwner[ownerId] = [];
        paymentsByOwner[ownerId].push({ ...p, ownerName });
    });

    Object.entries(paymentsByOwner).forEach(([, payments]) => {
        const ownerName = (payments[0] as any).ownerName;
        const total = payments.reduce((s: number, p: any) => s + (p.montant || 0), 0);
        ctx += `  • ${ownerName}: ${payments.length} paiement(s), total ${total.toFixed(2)} MAD\n`;
    });

    // ── 7. Late payments ──
    if (unpaid.length > 0) {
        ctx += `\n⚠️ PROPRIÉTAIRES AVEC CHARGES IMPAYÉES:\n`;
        const unpaidByOwner: Record<string, { name: string; total: number; apts: string[] }> = {};
        unpaid.forEach((ac: any) => {
            const apt = apartments.find((a: any) => a.id === ac.appartement?.id);
            if (apt?.proprietaire) {
                const ownerId = apt.proprietaire.id;
                const ownerName = `${apt.proprietaire.prenom} ${apt.proprietaire.nom}`;
                if (!unpaidByOwner[ownerId]) {
                    unpaidByOwner[ownerId] = { name: ownerName, total: 0, apts: [] };
                }
                unpaidByOwner[ownerId].total += ac.total || 0;
                if (!unpaidByOwner[ownerId].apts.includes(ac.appartement?.numero)) {
                    unpaidByOwner[ownerId].apts.push(ac.appartement?.numero);
                }
            }
        });
        Object.values(unpaidByOwner).forEach((info) => {
            ctx += `  • ${info.name} — ${info.total.toFixed(2)} MAD impayés — Appts: ${info.apts.join(', ')}\n`;
        });
    }

    return ctx;
}

/**
 * Generates PROPRIETAIRE context — only their own data.
 */
export function formatProprietaireContext(
    buildings: any[],
    apartments: any[],
    _charges: any[],
    appelCharges: any[],
    paiements: any[],
    userId: string
): string {
    let ctx = '';

    // Find user's apartments
    const myApartments = apartments.filter(
        (a: any) => a.proprietaire?.id === userId
    );

    if (myApartments.length === 0) {
        ctx += `ℹ️ Cet utilisateur n'a aucun appartement enregistré.\n`;
        return ctx;
    }

    const myApartmentIds = myApartments.map((a: any) => a.id);

    // ── User's apartments ──
    ctx += `🏠 MES APPARTEMENTS (${myApartments.length}):\n`;
    myApartments.forEach((a: any) => {
        const buildingName = a.immeuble?.nom || 'Inconnu';
        const building = buildings.find((b: any) => b.id === a.immeuble?.id);
        const totalAptsInBldg = apartments.filter(
            (apt: any) => apt.immeuble?.id === a.immeuble?.id
        ).length;
        ctx += `  • Appt "${a.numero}" — Étage ${a.etage} — ${a.surface} m² — Immeuble: "${buildingName}" (${building?.nombreEtages || 0} étages, ${totalAptsInBldg} appts au total, adresse: ${building?.adress || building?.adresse || 'N/A'})\n`;
    });

    // ── User's charges ──
    const myAppelCharges = appelCharges.filter(
        (ac: any) => myApartmentIds.includes(ac.appartement?.id)
    );
    const myPaid = myAppelCharges.filter((ac: any) => ac.status?.label === 'PAYÉ');
    const myUnpaid = myAppelCharges.filter((ac: any) => ac.status?.label !== 'PAYÉ');
    const totalOwed = myUnpaid.reduce((s: number, ac: any) => s + (ac.total || 0), 0);
    const totalMyPaid = myPaid.reduce((s: number, ac: any) => s + (ac.total || 0), 0);

    ctx += `\n💰 MES CHARGES (${myAppelCharges.length} au total):\n`;
    ctx += `  → ${myPaid.length} payées (${totalMyPaid.toFixed(2)} MAD) ✅\n`;
    ctx += `  → ${myUnpaid.length} impayées (${totalOwed.toFixed(2)} MAD) ❌\n`;

    myAppelCharges.forEach((ac: any) => {
        const aptNum = ac.appartement?.numero || '?';
        const chargeType = ac.charge?.type || ac.charge?.designation || 'Charge';
        const status = ac.status?.label || 'INCONNU';
        const statusIcon = status === 'PAYÉ' ? '✅' : '❌';
        ctx += `  • Appt ${aptNum} — "${chargeType}" — ${ac.total} MAD — Date: ${ac.dateEmission || 'N/A'} — ${statusIcon} ${status}\n`;
    });

    // ── User's payments ──
    const myPaiements = paiements.filter(
        (p: any) =>
            p.proprietaire?.id === userId ||
            myApartmentIds.includes(p.appartement?.id)
    );
    const totalPaidAmount = myPaiements.reduce((s: number, p: any) => s + (p.montant || 0), 0);

    ctx += `\n💳 MES PAIEMENTS (${myPaiements.length} effectués — ${totalPaidAmount.toFixed(2)} MAD au total):\n`;
    myPaiements.forEach((p: any) => {
        ctx += `  • ${p.montant} MAD — Date: ${p.datePaiement || 'N/A'} — Mode: ${p.modePaiement || 'N/A'}\n`;
    });

    // ── Summary ──
    ctx += `\n📊 RÉSUMÉ:\n`;
    ctx += `  • Total payé: ${totalPaidAmount.toFixed(2)} MAD\n`;
    ctx += `  • Reste à payer: ${totalOwed.toFixed(2)} MAD\n`;
    ctx += `  • Statut: ${myUnpaid.length === 0 ? '✅ Toutes les charges sont payées !' : `⚠️ ${myUnpaid.length} charge(s) impayée(s)`}\n`;

    return ctx;
}

package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.Immeuble;

import java.util.List;

public interface ImmeubleService {

    Immeuble CreateImmeuble(Immeuble immeuble);

    Immeuble updateImmeuble(Long id, Immeuble immeuble);



    void deleteImmeuble(Long id);

    // 📋 Get all
    List<Immeuble> getAllImmeubles();

    // 🔍 Get by id
    Immeuble getImmeubleById(Long id);

    // 🏠 Appartements par immeuble
    List<Appartement> getAppartementsByImmeuble(Long immeubleId);

    // 🔢 Count appartements (optionnel)
    int countAppartementsInImmeuble(Long immeubleId);

    Immeuble assignSyndic(Long immeubleId, Long syndicId);
}

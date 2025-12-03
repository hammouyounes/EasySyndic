package com.example.backend_syndic.service;

import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.Immeuble;
import com.example.backend_syndic.repository.ImmeubleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ImmeubleService {

    @Autowired
    private ImmeubleRepository repo;

    public Immeuble CreateImmeuble(Immeuble immeuble){
        return repo.save(immeuble);
    }
    public Immeuble UpdateImmeuble(Long id,Immeuble UpdatedImmeuble){
        Immeuble exisiting = repo.findById(id).orElseThrow(()-> new RuntimeException("immeuble not found"));

        exisiting.setNom(UpdatedImmeuble.getNom());
        exisiting.setAdress(UpdatedImmeuble.getAdress());
        exisiting.setNombreAppartement(UpdatedImmeuble.getNombreAppartement());

        exisiting.getAppartements().clear();
        for (Appartement app : UpdatedImmeuble.getAppartements()){
            app.setImmeuble(exisiting);
            exisiting.getAppartements().add(app);
        }
        return repo.save(exisiting);
    }

    public Immeuble deleteImmeuble(Long id) {
        Immeuble existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));
        repo.delete(existing);
        return existing; // useful if you want to show deleted info
    }


}

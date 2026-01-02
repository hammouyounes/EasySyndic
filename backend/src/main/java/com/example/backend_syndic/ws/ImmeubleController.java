package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.Immeuble;
import com.example.backend_syndic.service.facade.ImmeubleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/immeubles")
public class ImmeubleController {

    @Autowired
    private ImmeubleService immeubleService;

    // GET /api/immeubles
    @GetMapping
    public List<Immeuble> getAllImmeubles() {
        return immeubleService.getAllImmeubles();
    }
    // GET /api/immeubles/{id}
    @GetMapping("/{id}")
    public Immeuble getImmeubleById(@PathVariable Long id) {
        return immeubleService.getImmeubleById(id);
    }

    // POST /api/immeubles
    @PostMapping
    public Immeuble createImmeuble(@RequestBody Immeuble immeuble) {
        return immeubleService.CreateImmeuble(immeuble);
    }

    // PUT /api/immeubles/{id}
    @PutMapping("/{id}")
    public Immeuble updateImmeuble(@PathVariable Long id, @RequestBody Immeuble immeuble) {
        return immeubleService.updateImmeuble(id, immeuble);
    }

    // DELETE /api/immeubles/{id}
    @DeleteMapping("/{id}")
    public void deleteImmeuble(@PathVariable Long id) {
        immeubleService.deleteImmeuble(id);
    }
}

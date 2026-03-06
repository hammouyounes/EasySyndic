package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.User;
import com.example.backend_syndic.service.facade.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            User user = userService.login(loginRequest.getEmail(), loginRequest.getMotDePasse());
            if (user != null) {
                // Build a clean response to avoid lazy-loading issues with JPA relationships
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("nom", user.getNom());
                response.put("prenom", user.getPrenom());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("active", user.getActive());
                return ResponseEntity.ok(response);
            }
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Une erreur interne est survenue.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Email ou mot de passe incorrect");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUtilisateurs();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUtilisateur(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUtilisateurById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUtilisateur(id, user));
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUtilisateur(id);
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleStatus(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.toggleStatus(id));
    }
}

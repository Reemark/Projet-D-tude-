package uncharted.demo.model;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String pseudo;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean isActive = true;
    private boolean emailVerified = false;

    private String siret;
    private boolean siretVerified = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // AJOUTER CECI POUR CORRIGER L'ERREUR DE MAPPING
    // Cela permet de dire à Hibernate qu'un utilisateur peut avoir plusieurs chasses
    @OneToMany(mappedBy = "creator")
    private List<Hunt> hunts;

    // Automatisations des dates
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- GETTERS & SETTERS ---

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPseudo() { return pseudo; }
    public void setPseudo(String pseudo) { this.pseudo = pseudo; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }

    public boolean isSiretVerified() { return siretVerified; }
    public void setSiretVerified(boolean siretVerified) { this.siretVerified = siretVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Hunt> getHunts() { return hunts; }
    public void setHunts(List<Hunt> hunts) { this.hunts = hunts; }
}
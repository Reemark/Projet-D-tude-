package uncharted.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import uncharted.demo.model.Role;
import uncharted.demo.model.User;
import uncharted.demo.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@lootopia.com")) {
            return;
        }

        User admin = new User();
        admin.setEmail("admin@lootopia.com");
        admin.setPassword(passwordEncoder.encode("Admin1234!"));
        admin.setPseudo("Admin");
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setEmailVerified(true);

        userRepository.save(admin);
        System.out.println("[DataSeeder] Compte admin créé : admin@lootopia.com / Admin1234!");
    }
}

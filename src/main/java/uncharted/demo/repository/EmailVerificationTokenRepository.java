package uncharted.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uncharted.demo.model.EmailVerificationToken;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Integer> {
    Optional<EmailVerificationToken> findByToken(String token);
}

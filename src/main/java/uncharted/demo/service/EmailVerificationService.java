package uncharted.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import uncharted.demo.exception.BadRequestException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.EmailVerificationToken;
import uncharted.demo.model.User;
import uncharted.demo.repository.EmailVerificationTokenRepository;
import uncharted.demo.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@lootopia.com}")
    private String fromEmail;

    public EmailVerificationService(EmailVerificationTokenRepository tokenRepository,
                                    UserRepository userRepository,
                                    JavaMailSender mailSender) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();

        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiresAt(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Lootopia - Vérification de votre email");
        message.setText("Bonjour " + user.getPseudo() + ",\n\n"
                + "Cliquez sur ce lien pour vérifier votre email :\n"
                + "http://localhost:8080/api/auth/verify-email?token=" + token + "\n\n"
                + "Ce lien expire dans 24h.");
        mailSender.send(message);
    }

    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Token invalide"));

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token expiré");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
    }
}

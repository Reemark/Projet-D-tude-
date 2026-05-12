package uncharted.demo.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uncharted.demo.dto.UserProgressDto;
import uncharted.demo.exception.BadRequestException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.*;
import uncharted.demo.repository.*;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProgressServiceTest {

    @Mock
    private UserProgressRepository userProgressRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StepRepository stepRepository;
    @Mock
    private ParticipationRepository participationRepository;

    @InjectMocks
    private UserProgressService userProgressService;

    @Test
    void dig_shouldCompleteStep_whenValid() {
        User user = new User();
        user.setId(1);
        user.setEmail("player@test.com");

        Hunt hunt = new Hunt();
        hunt.setId(1);

        Step step = new Step();
        step.setId(1);
        step.setHunt(hunt);
        step.setStepOrder(1);
        step.setScore(10);

        Participation participation = new Participation();
        participation.setScore(0);

        UserProgress progress = new UserProgress();
        progress.setId(1);
        progress.setUser(user);
        progress.setHunt(hunt);
        progress.setStep(step);
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(stepRepository.findById(1)).thenReturn(Optional.of(step));
        when(participationRepository.existsByUserIdAndHuntId(1, 1)).thenReturn(true);
        when(userProgressRepository.findByUserIdAndStepId(1, 1)).thenReturn(Optional.empty());
        when(userProgressRepository.save(any())).thenReturn(progress);
        when(participationRepository.findByUserIdAndHuntId(1, 1)).thenReturn(Optional.of(participation));

        UserProgressDto.Response response = userProgressService.dig(1, "player@test.com");

        assertTrue(response.isCompleted());
        verify(participationRepository).save(any());
    }

    @Test
    void dig_shouldThrow_whenNotParticipating() {
        User user = new User();
        user.setId(1);
        user.setEmail("player@test.com");

        Hunt hunt = new Hunt();
        hunt.setId(1);

        Step step = new Step();
        step.setId(1);
        step.setHunt(hunt);

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(stepRepository.findById(1)).thenReturn(Optional.of(step));
        when(participationRepository.existsByUserIdAndHuntId(1, 1)).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userProgressService.dig(1, "player@test.com"));
    }

    @Test
    void dig_shouldThrow_whenAlreadyCompleted() {
        User user = new User();
        user.setId(1);
        user.setEmail("player@test.com");

        Hunt hunt = new Hunt();
        hunt.setId(1);

        Step step = new Step();
        step.setId(1);
        step.setHunt(hunt);

        UserProgress existing = new UserProgress();
        existing.setCompleted(true);

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(stepRepository.findById(1)).thenReturn(Optional.of(step));
        when(participationRepository.existsByUserIdAndHuntId(1, 1)).thenReturn(true);
        when(userProgressRepository.findByUserIdAndStepId(1, 1)).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> userProgressService.dig(1, "player@test.com"));
    }

    @Test
    void dig_shouldThrow_whenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> userProgressService.dig(1, "unknown@test.com"));
    }

    @Test
    void dig_shouldThrow_whenStepNotFound() {
        User user = new User();
        user.setId(1);
        user.setEmail("player@test.com");

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(stepRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> userProgressService.dig(99, "player@test.com"));
    }
}

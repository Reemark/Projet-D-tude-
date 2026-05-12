package uncharted.demo.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uncharted.demo.dto.ParticipationDto;
import uncharted.demo.exception.BadRequestException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.*;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.ParticipationRepository;
import uncharted.demo.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParticipationServiceTest {

    @Mock
    private ParticipationRepository participationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private HuntRepository huntRepository;

    @InjectMocks
    private ParticipationService participationService;

    @Test
    void join_shouldSucceed_whenNotAlreadyJoined() {
        User user = new User();
        user.setId(1);
        user.setPseudo("Player");
        user.setEmail("player@test.com");

        Hunt hunt = new Hunt();
        hunt.setId(1);
        hunt.setTitle("Hunt");

        Participation participation = new Participation();
        participation.setId(1);
        participation.setUser(user);
        participation.setHunt(hunt);
        participation.setStatus(Status.IN_PROGRESS);
        participation.setScore(0);
        participation.setCreatedAt(LocalDateTime.now());

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(huntRepository.findById(1)).thenReturn(Optional.of(hunt));
        when(participationRepository.existsByUserIdAndHuntId(1, 1)).thenReturn(false);
        when(participationRepository.save(any())).thenReturn(participation);

        ParticipationDto.Response response = participationService.join(1, "player@test.com");

        assertNotNull(response);
        assertEquals("Player", response.userPseudo());
    }

    @Test
    void join_shouldThrow_whenAlreadyJoined() {
        User user = new User();
        user.setId(1);
        user.setEmail("player@test.com");

        Hunt hunt = new Hunt();
        hunt.setId(1);

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(huntRepository.findById(1)).thenReturn(Optional.of(hunt));
        when(participationRepository.existsByUserIdAndHuntId(1, 1)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> participationService.join(1, "player@test.com"));
    }

    @Test
    void join_shouldThrow_whenHuntNotFound() {
        User user = new User();
        user.setId(1);
        user.setEmail("player@test.com");

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(huntRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> participationService.join(99, "player@test.com"));
    }
}

package uncharted.demo.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uncharted.demo.dto.HuntDto;
import uncharted.demo.exception.ForbiddenException;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.Difficulty;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.User;
import uncharted.demo.model.Role;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.ParticipationRepository;
import uncharted.demo.repository.StepRepository;
import uncharted.demo.repository.UserProgressRepository;
import uncharted.demo.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HuntServiceTest {

    @Mock private HuntRepository huntRepository;
    @Mock private UserRepository userRepository;
    @Mock private StepRepository stepRepository;
    @Mock private ParticipationRepository participationRepository;
    @Mock private UserProgressRepository userProgressRepository;

    @InjectMocks
    private HuntService huntService;

    @Test
    void create_shouldReturnHunt_whenUserExists() {
        User creator = new User();
        creator.setEmail("partner@test.com");
        creator.setPseudo("Partner");

        Hunt hunt = new Hunt();
        hunt.setId(1);
        hunt.setTitle("Test Hunt");
        hunt.setDescription("Desc");
        hunt.setDifficulty(Difficulty.EASY);
        hunt.setCreator(creator);
        hunt.setCreatedAt(LocalDateTime.now());

        when(userRepository.findByEmail("partner@test.com")).thenReturn(Optional.of(creator));
        when(huntRepository.save(any(Hunt.class))).thenReturn(hunt);

        HuntDto.CreateRequest request = new HuntDto.CreateRequest("Test Hunt", "Desc", Difficulty.EASY, null);
        HuntDto.Response response = huntService.create(request, "partner@test.com");

        assertEquals("Test Hunt", response.title());
        assertEquals("Partner", response.creatorPseudo());
    }

    @Test
    void getById_shouldThrow_whenNotFound() {
        when(huntRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> huntService.getById(99));
    }

    @Test
    void delete_shouldThrow_whenNotOwner() {
        User creator = new User();
        creator.setEmail("owner@test.com");

        User requester = new User();
        requester.setEmail("other@test.com");
        requester.setRole(Role.USER);

        Hunt hunt = new Hunt();
        hunt.setId(1);
        hunt.setCreator(creator);

        when(huntRepository.findById(1)).thenReturn(Optional.of(hunt));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(requester));

        assertThrows(ForbiddenException.class, () -> huntService.delete(1, "other@test.com"));
        verify(huntRepository, never()).delete(any());
    }

    @Test
    void getAllActive_shouldReturnList() {
        User creator = new User();
        creator.setPseudo("Creator");

        Hunt hunt = new Hunt();
        hunt.setId(1);
        hunt.setTitle("Active Hunt");
        hunt.setDifficulty(Difficulty.MEDIUM);
        hunt.setCreator(creator);
        hunt.setActive(true);
        hunt.setCreatedAt(LocalDateTime.now());

        when(huntRepository.findByIsActiveTrue()).thenReturn(List.of(hunt));

        List<HuntDto.Response> result = huntService.getAllActive();

        assertEquals(1, result.size());
        assertEquals("Active Hunt", result.get(0).title());
    }
}

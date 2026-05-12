package uncharted.demo.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uncharted.demo.dto.StepDto;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.ArContent;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.Step;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.StepRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StepServiceTest {

    @Mock
    private StepRepository stepRepository;
    @Mock
    private HuntRepository huntRepository;

    @InjectMocks
    private StepService stepService;

    @Test
    void create_shouldReturnStep_whenHuntExists() {
        Hunt hunt = new Hunt();
        hunt.setId(1);

        Step step = new Step();
        step.setId(1);
        step.setHunt(hunt);
        step.setStepOrder(1);
        step.setLatitude(48.8566);
        step.setLongitude(2.3522);
        step.setArContent(ArContent.OBJECT_3D);
        step.setClue("Cherchez ici");
        step.setArModelUrl("https://example.com/model.glb");
        step.setScore(15);

        when(huntRepository.findById(1)).thenReturn(Optional.of(hunt));
        when(stepRepository.save(any(Step.class))).thenReturn(step);

        StepDto.CreateRequest request = new StepDto.CreateRequest(
                1, 1, 48.8566, 2.3522, ArContent.OBJECT_3D, "Cherchez ici",
                "https://example.com/model.glb", 15);

        StepDto.Response response = stepService.create(request);

        assertEquals(1, response.id());
        assertEquals(48.8566, response.latitude());
        assertEquals("https://example.com/model.glb", response.arModelUrl());
        verify(stepRepository).save(any(Step.class));
    }

    @Test
    void create_shouldThrow_whenHuntNotFound() {
        when(huntRepository.findById(99)).thenReturn(Optional.empty());

        StepDto.CreateRequest request = new StepDto.CreateRequest(
                99, 1, 48.0, 2.0, ArContent.TEXT, "Indice", null, 10);

        assertThrows(NotFoundException.class, () -> stepService.create(request));
    }

    @Test
    void getByHuntId_shouldReturnOrderedSteps() {
        Hunt hunt = new Hunt();
        hunt.setId(1);

        Step step1 = new Step();
        step1.setId(1);
        step1.setHunt(hunt);
        step1.setStepOrder(1);
        step1.setLatitude(48.0);
        step1.setLongitude(2.0);
        step1.setArContent(ArContent.TEXT);
        step1.setClue("Premier");
        step1.setScore(10);

        Step step2 = new Step();
        step2.setId(2);
        step2.setHunt(hunt);
        step2.setStepOrder(2);
        step2.setLatitude(48.1);
        step2.setLongitude(2.1);
        step2.setArContent(ArContent.IMAGE);
        step2.setClue("Deuxième");
        step2.setScore(20);

        when(stepRepository.findByHuntIdOrderByStepOrderAsc(1)).thenReturn(List.of(step1, step2));

        List<StepDto.Response> result = stepService.getByHuntId(1);

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).stepOrder());
        assertEquals(2, result.get(1).stepOrder());
    }

    @Test
    void delete_shouldThrow_whenStepNotFound() {
        when(stepRepository.existsById(99)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> stepService.delete(99));
    }

    @Test
    void delete_shouldSucceed_whenStepExists() {
        when(stepRepository.existsById(1)).thenReturn(true);
        stepService.delete(1);
        verify(stepRepository).deleteById(1);
    }
}

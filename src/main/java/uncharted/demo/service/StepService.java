package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.StepDto;
import uncharted.demo.exception.NotFoundException;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.Step;
import uncharted.demo.repository.HuntRepository;
import uncharted.demo.repository.StepRepository;

import java.util.List;

@Service
public class StepService {

    private final StepRepository stepRepository;
    private final HuntRepository huntRepository;

    public StepService(StepRepository stepRepository, HuntRepository huntRepository) {
        this.stepRepository = stepRepository;
        this.huntRepository = huntRepository;
    }

    public StepDto.Response create(StepDto.CreateRequest request) {
        Hunt hunt = huntRepository.findById(request.huntId())
                .orElseThrow(() -> new NotFoundException("Chasse non trouvée"));

        Step step = new Step();
        step.setHunt(hunt);
        step.setStepOrder(request.stepOrder());
        step.setLatitude(request.latitude());
        step.setLongitude(request.longitude());
        step.setArContent(request.arContent());
        step.setClue(request.clue());
        step.setArModelUrl(request.arModelUrl());
        step.setScore(request.score());
        step = stepRepository.save(step);

        return toResponse(step);
    }

    public List<StepDto.Response> getByHuntId(Integer huntId) {
        return stepRepository.findByHuntIdOrderByStepOrderAsc(huntId)
                .stream().map(this::toResponse).toList();
    }

    public void delete(Integer id) {
        if (!stepRepository.existsById(id)) {
            throw new NotFoundException("Étape non trouvée");
        }
        stepRepository.deleteById(id);
    }

    private StepDto.Response toResponse(Step step) {
        return new StepDto.Response(
                step.getId(),
                step.getHunt().getId(),
                step.getStepOrder(),
                step.getLatitude(),
                step.getLongitude(),
                step.getArContent(),
                step.getClue(),
                step.getArModelUrl(),
                step.getScore()
        );
    }
}

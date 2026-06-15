package uncharted.demo.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.StepDto;
import uncharted.demo.service.StepService;

import java.util.List;

@RestController
@RequestMapping("/api/hunts/{huntId}/steps")
public class StepController {

    private final StepService stepService;

    public StepController(StepService stepService) {
        this.stepService = stepService;
    }

    @GetMapping
    public ResponseEntity<List<StepDto.Response>> getSteps(@PathVariable Integer huntId) {
        return ResponseEntity.ok(stepService.getByHuntId(huntId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<StepDto.Response> create(@PathVariable Integer huntId,
                                                   @Valid @RequestBody StepDto.CreateRequest request) {
        return ResponseEntity.ok(stepService.create(request));
    }

    @PutMapping("/{stepId}")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<StepDto.Response> update(@PathVariable Integer huntId,
                                                    @PathVariable Integer stepId,
                                                    @Valid @RequestBody StepDto.UpdateRequest request) {
        return ResponseEntity.ok(stepService.update(stepId, request));
    }

    @DeleteMapping("/{stepId}")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer huntId, @PathVariable Integer stepId) {
        stepService.delete(stepId);
        return ResponseEntity.noContent().build();
    }
}

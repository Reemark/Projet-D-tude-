package uncharted.demo.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.HuntDto;
import uncharted.demo.service.HuntService;

import java.util.List;

@RestController
@RequestMapping("/api/hunts")
public class HuntController {

    private final HuntService huntService;

    public HuntController(HuntService huntService) {
        this.huntService = huntService;
    }

    @GetMapping
    public ResponseEntity<List<HuntDto.Response>> getAllActive() {
        return ResponseEntity.ok(huntService.getAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HuntDto.Response> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(huntService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<HuntDto.Response> create(@Valid @RequestBody HuntDto.CreateRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(huntService.create(request, auth.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<HuntDto.Response> update(@PathVariable Integer id,
                                                    @Valid @RequestBody HuntDto.UpdateRequest request,
                                                    Authentication auth) {
        return ResponseEntity.ok(huntService.update(id, request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id, Authentication auth) {
        huntService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    public ResponseEntity<List<HuntDto.Response>> getMyHunts(Authentication auth) {
        return ResponseEntity.ok(huntService.getByCreator(auth.getName()));
    }
}

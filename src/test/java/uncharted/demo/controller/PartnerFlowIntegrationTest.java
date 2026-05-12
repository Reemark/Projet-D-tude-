package uncharted.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import uncharted.demo.dto.AuthDto;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PartnerFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullPartnerFlow_createHuntAndAddSteps() throws Exception {
        // 1. Inscription partenaire avec SIRET valide
        AuthDto.RegisterPartnerRequest partnerRequest = new AuthDto.RegisterPartnerRequest(
                "partner-flow@test.com", "password123", "PartnerFlow", "73282932000074");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register/partner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partnerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("PARTNER"))
                .andReturn();

        String token = objectMapper.readTree(registerResult.getResponse().getContentAsString())
                .get("token").asText();

        // 2. Créer une chasse
        Map<String, Object> huntPayload = Map.of(
                "title", "Chasse Intégration",
                "description", "Test du flow complet",
                "difficulty", "MEDIUM");

        MvcResult huntResult = mockMvc.perform(post("/api/hunts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(huntPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Chasse Intégration"))
                .andExpect(jsonPath("$.creatorPseudo").value("PartnerFlow"))
                .andReturn();

        int huntId = objectMapper.readTree(huntResult.getResponse().getContentAsString())
                .get("id").asInt();

        // 3. Ajouter une étape avec modèle 3D
        Map<String, Object> stepPayload = Map.of(
                "huntId", huntId,
                "stepOrder", 1,
                "latitude", 48.8566,
                "longitude", 2.3522,
                "arContent", "OBJECT_3D",
                "clue", "Cherchez près de la tour",
                "arModelUrl", "https://example.com/chest.glb",
                "score", 15);

        mockMvc.perform(post("/api/hunts/" + huntId + "/steps")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stepPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latitude").value(48.8566))
                .andExpect(jsonPath("$.arModelUrl").value("https://example.com/chest.glb"))
                .andExpect(jsonPath("$.score").value(15));

        // 4. Vérifier que la chasse est listée publiquement
        mockMvc.perform(get("/api/hunts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Chasse Intégration')]").exists());

        // 5. Vérifier les étapes
        mockMvc.perform(get("/api/hunts/" + huntId + "/steps"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].clue").value("Cherchez près de la tour"));

        // 6. Vérifier "mes chasses" du partenaire
        mockMvc.perform(get("/api/hunts/mine")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Chasse Intégration')]").exists());
    }

    @Test
    void registerPartner_shouldFail_withInvalidSiret() throws Exception {
        AuthDto.RegisterPartnerRequest request = new AuthDto.RegisterPartnerRequest(
                "bad-siret@test.com", "password123", "BadSiret", "12345678901234");

        mockMvc.perform(post("/api/auth/register/partner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createHunt_shouldFail_withUserRole() throws Exception {
        // Inscription en tant que USER
        AuthDto.RegisterRequest userRequest = new AuthDto.RegisterRequest(
                "user-noperm@test.com", "password123", "SimpleUser");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(registerResult.getResponse().getContentAsString())
                .get("token").asText();

        // Tentative de création de chasse → 403
        Map<String, Object> huntPayload = Map.of(
                "title", "Hack", "description", "Nope", "difficulty", "EASY");

        mockMvc.perform(post("/api/hunts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(huntPayload)))
                .andExpect(status().isForbidden());
    }
}

package com.example.backend_syndic.service.Impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.system-prompt}")
    private String systemPrompt;

    @org.springframework.beans.factory.annotation.Autowired
    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    /**
     * Generate a professional Arabic email using Gemini AI.
     * Falls back to a hardcoded template if the API call fails.
     */
    public String generateChargeEmail(String ownerName, String chargeType, double amount, String periode) {
        try {
            String userPrompt = String.format(
                "Write an email to the owner named '%s'. " +
                "The charge type is '%s', the amount is %.2f MAD, and the period is '%s'. " +
                "The email must be entirely in Arabic.",
                ownerName, chargeType, amount, periode
            );

            // Build the Gemini API request body
            Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", userPrompt)))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 1024
                )
            );

            String url = String.format(
                "/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
            );

            Map response = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // Parse the response
            if (response != null && response.containsKey("candidates")) {
                List<Map> candidates = (List<Map>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map content = (Map) candidates.get(0).get("content");
                    if (content != null) {
                        List<Map> parts = (List<Map>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            String generatedText = (String) parts.get(0).get("text");
                            if (generatedText != null && !generatedText.isBlank()) {
                                System.out.println("✅ Gemini AI generated email successfully for: " + ownerName);
                                return generatedText;
                            }
                        }
                    }
                }
            }

            // If parsing failed, fall back
            System.err.println("⚠️ Gemini response was empty or unparseable. Using fallback template.");
            return getFallbackTemplate(ownerName, chargeType, amount, periode);

        } catch (WebClientResponseException e) {
            System.err.println("❌ Gemini API error (HTTP " + e.getStatusCode() + "): " + e.getResponseBodyAsString());
            return getFallbackTemplate(ownerName, chargeType, amount, periode);
        } catch (Exception e) {
            System.err.println("❌ Gemini API call failed: " + e.getMessage());
            return getFallbackTemplate(ownerName, chargeType, amount, periode);
        }
    }

    /**
     * Hardcoded Arabic fallback template used when Gemini API is unavailable.
     */
    private String getFallbackTemplate(String ownerName, String chargeType, double amount, String periode) {
        System.out.println("📧 Using fallback Arabic email template for: " + ownerName);
        return String.format(
            "بسم الله الرحمن الرحيم\n\n" +
            "السيد(ة) %s المحترم(ة)،\n\n" +
            "تحية طيبة وبعد،\n\n" +
            "يشرفنا أن نحيطكم علما بأنه تم تسجيل مستحقات جديدة خاصة بعمارتكم، وفيما يلي تفاصيلها:\n\n" +
            "• نوع المستحقات: %s\n" +
            "• المبلغ الإجمالي: %.2f درهم مغربي\n" +
            "• الفترة المعنية: %s\n\n" +
            "نلتمس منكم التكرم بتسوية المبلغ المستحق في أقرب الآجال.\n\n" +
            "وتفضلوا بقبول فائق التقدير والاحترام.\n\n" +
            "إدارة السنديك",
            ownerName, chargeType, amount, periode
        );
    }
}

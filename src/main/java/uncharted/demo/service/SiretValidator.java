package uncharted.demo.service;

public final class SiretValidator {

    private SiretValidator() {}

    /**
     * Valide un numéro SIRET via l'algorithme de Luhn.
     * Un SIRET valide contient 14 chiffres et la somme pondérée est divisible par 10.
     * Les positions impaires (1-indexed) sont doublées.
     */
    public static boolean isValid(String siret) {
        if (siret == null || !siret.matches("\\d{14}")) {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 14; i++) {
            int digit = Character.getNumericValue(siret.charAt(i));
            // Positions impaires (1-indexed) : indices 0, 2, 4... sont doublés
            if (i % 2 == 0) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 == 0;
    }
}

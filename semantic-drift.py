import numpy as np
import random
from typing import List, Tuple, Dict
import re

class SemanticDriftAlgorithm:
def **init**(self):
# Core parameters
self.theta = 0.3  # temperature (transformation intensity)
self.rho = 0.4    # randomness factor
self.delta = 0.8  # optimal drift threshold
self.lambda_limiter = 0.9  # drift limiter

```
    # Initialize tracking variables
    self.iterations = []
    self.x_current = 0
    self.y_current = 1.0
    
    # Dynamic transformation matrices
    self.vowel_shifts = {'a': 'e', 'e': 'i', 'i': 'o', 'o': 'u', 'u': 'a'}
    self.consonant_shifts = {
        'b': 'p', 'p': 'b', 'd': 't', 't': 'd', 'g': 'k', 'k': 'g',
        'f': 'v', 'v': 'f', 's': 'z', 'z': 's', 'm': 'n', 'n': 'm'
    }
    
def tokenize(self, text: str) -> List[str]:
    """Extract word set from text"""
    # Simple tokenization, removing common words for core semantic focus
    words = re.findall(r'\b\w+\b', text.lower())
    stopwords = {'the', 'as', 'of', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with'}
    return [w for w in words if w not in stopwords]

def semantic_distance(self, word: str, iteration: int) -> float:
    """σ(w,i) - Calculate semantic distance for word w at iteration i"""
    base_distance = 0.1 * iteration * self.theta
    random_factor = random.uniform(-self.rho, self.rho)
    return min(1.0, base_distance + random_factor)

def generate_morphological_variants(self, word: str) -> List[str]:
    """Generate morphological transformations"""
    variants = []
    
    # Prefix transformations
    prefixes = ['re', 'un', 'pre', 'dis', 'over', 'under', 'mis']
    if len(word) > 4:
        variants.extend([prefix + word for prefix in prefixes])
    
    # Suffix transformations
    suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'ness', 'tion', 'able']
    if len(word) > 3:
        variants.extend([word + suffix for suffix in suffixes])
    
    # Remove existing prefixes/suffixes
    for prefix in prefixes:
        if word.startswith(prefix) and len(word) > len(prefix) + 2:
            variants.append(word[len(prefix):])
    
    for suffix in suffixes:
        if word.endswith(suffix) and len(word) > len(suffix) + 2:
            variants.append(word[:-len(suffix)])
    
    return variants

def phonetic_transform(self, word: str, intensity: float) -> str:
    """Apply phonetic transformations based on intensity"""
    if len(word) < 2:
        return word
        
    chars = list(word.lower())
    transform_count = max(1, int(len(word) * intensity))
    
    for _ in range(transform_count):
        pos = random.randint(0, len(chars) - 1)
        char = chars[pos]
        
        # Vowel shifts
        if char in self.vowel_shifts:
            chars[pos] = self.vowel_shifts[char]
        # Consonant shifts
        elif char in self.consonant_shifts:
            chars[pos] = self.consonant_shifts[char]
        # Random character mutation
        elif random.random() < 0.3:
            chars[pos] = chr(ord('a') + random.randint(0, 25))
    
    return ''.join(chars)

def character_level_transform(self, word: str, sigma: float) -> str:
    """Apply character-level transformations"""
    if len(word) < 2:
        return word
        
    chars = list(word)
    
    # Insertion
    if random.random() < sigma * 0.3:
        pos = random.randint(0, len(chars))
        chars.insert(pos, chr(ord('a') + random.randint(0, 25)))
    
    # Deletion
    if len(chars) > 2 and random.random() < sigma * 0.2:
        chars.pop(random.randint(0, len(chars) - 1))
    
    # Substitution
    if random.random() < sigma * 0.4:
        pos = random.randint(0, len(chars) - 1)
        chars[pos] = chr(ord('a') + random.randint(0, 25))
    
    # Transposition
    if len(chars) > 2 and random.random() < sigma * 0.3:
        i = random.randint(0, len(chars) - 2)
        chars[i], chars[i + 1] = chars[i + 1], chars[i]
    
    return ''.join(chars)

def semantic_similarity_transform(self, word: str, sigma: float) -> str:
    """Transform based on semantic similarity principles"""
    if len(word) < 3:
        return word
        
    # Generate multiple transformation candidates
    candidates = []
    
    # Phonetic variants
    candidates.append(self.phonetic_transform(word, sigma))
    
    # Character-level variants
    candidates.append(self.character_level_transform(word, sigma))
    
    # Morphological variants
    morphological = self.generate_morphological_variants(word)
    if morphological:
        candidates.extend(random.sample(morphological, min(3, len(morphological))))
    
    # Length-based transformations
    if sigma > 0.6:
        # High sigma: more dramatic changes
        if len(word) > 5:
            candidates.append(word[:len(word)//2] + word[len(word)//2:][::-1])
        candidates.append(word[::-1])  # Reverse
    
    # Select transformation based on sigma
    if not candidates:
        return word
        
    if sigma < 0.3:
        # Low sigma: prefer minimal changes
        return min(candidates, key=lambda x: abs(len(x) - len(word)))
    else:
        # Higher sigma: allow more variation
        return random.choice(candidates)

def transform_word(self, word: str, sigma: float) -> str:
    """S(w, σ(w,i)) - Dynamic semantic transformation function"""
    if len(word) == 0:
        return word
        
    # Apply lambda limiter to sigma
    effective_sigma = min(sigma, self.lambda_limiter)
    
    # Multi-stage transformation based on sigma threshold
    if effective_sigma > self.delta:
        # High transformation: semantic similarity approach
        return self.semantic_similarity_transform(word, effective_sigma)
    elif effective_sigma > 0.4:
        # Medium transformation: phonetic changes
        return self.phonetic_transform(word, effective_sigma)
    elif effective_sigma > 0.1:
        # Low transformation: character-level changes
        return self.character_level_transform(word, effective_sigma)
    else:
        # Minimal transformation: return original
        return word

def edit_distance(self, s1: str, s2: str) -> float:
    """Calculate normalized edit distance between strings"""
    if len(s1) == 0: return len(s2)
    if len(s2) == 0: return len(s1)
    
    # Dynamic programming approach
    matrix = [[0] * (len(s2) + 1) for _ in range(len(s1) + 1)]
    
    for i in range(len(s1) + 1):
        matrix[i][0] = i
    for j in range(len(s2) + 1):
        matrix[0][j] = j
        
    for i in range(1, len(s1) + 1):
        for j in range(1, len(s2) + 1):
            if s1[i-1] == s2[j-1]:
                cost = 0
            else:
                cost = 1
            matrix[i][j] = min(
                matrix[i-1][j] + 1,      # deletion
                matrix[i][j-1] + 1,      # insertion
                matrix[i-1][j-1] + cost  # substitution
            )
    
    max_len = max(len(s1), len(s2))
    return matrix[len(s1)][len(s2)] / max_len if max_len > 0 else 0

def calculate_distance(self, text1: str, text2: str) -> float:
    """d(Ti,T0) - Distance measurement function"""
    return self.edit_distance(text1.lower(), text2.lower())

def transform_text(self, text: str, word_set: List[str], iteration: int) -> str:
    """Apply transformation to entire text"""
    transformed_words = []
    
    for word in word_set:
        sigma = self.semantic_distance(word, iteration)
        transformed = self.transform_word(word, sigma)
        transformed_words.append(transformed)
    
    # Maintain original text structure
    original_words = text.split()
    if len(original_words) <= 2:
        # Short text (likely a term): join directly
        return ' '.join(transformed_words)
    else:
        # Longer text: preserve structure while transforming content words
        result = []
        content_idx = 0
        
        for orig_word in original_words:
            clean_word = re.sub(r'[^\w]', '', orig_word.lower())
            if clean_word in [w.lower() for w in word_set] and content_idx < len(transformed_words):
                # Replace with transformed version, preserving punctuation
                punct = ''.join(c for c in orig_word if not c.isalnum())
                result.append(transformed_words[content_idx] + punct)
                content_idx += 1
            else:
                # Keep original word (function words, punctuation)
                result.append(orig_word)
        
        return ' '.join(result)

def check_constraint(self, Ti: str, Di: str, T0: str, D0: str) -> bool:
    """Verify distance constraint: d(Ti,T0) + d(Di,D0) ≤ 2*y_current"""
    term_distance = self.calculate_distance(Ti, T0)
    def_distance = self.calculate_distance(Di, D0)
    total_distance = term_distance + def_distance
    return total_distance <= 2 * self.y_current

def execute_algorithm(self, T0: str, D0: str, max_iterations: int = 10) -> Dict:
    """Main algorithm execution"""
    # Initialize
    W_T0 = self.tokenize(T0)
    W_D0 = self.tokenize(D0)
    
    # Track all iterations
    results = []
    
    for i in range(max_iterations):
        # Transform term and definition
        Ti = self.transform_text(T0, W_T0, i)
        Di = self.transform_text(D0, W_D0, i)
        
        # Check constraint
        if self.check_constraint(Ti, Di, T0, D0):
            # Update current values
            self.x_current = i
            
            # Calculate new y_current with lambda limiter
            distance_sum = (self.calculate_distance(Ti, T0) + 
                          self.calculate_distance(Di, D0))
            self.y_current = max(0.1, self.y_current * self.lambda_limiter - 
                               distance_sum * 0.1)
            
            # Store result in format: [i, Ti, Di, x_current, y_current, θ, ρ]
            result = [i, Ti, Di, self.x_current, self.y_current, 
                     self.theta, self.rho]
            results.append(result)
        else:
            # Constraint violated, adjust parameters
            self.theta *= 0.8
            self.rho *= 0.9
    
    # Generate specified variations V = {V240, V280, V350, V420}
    variations = {}
    if len(results) >= 4:
        variations['V240'] = results[min(2, len(results)-1)]
        variations['V280'] = results[min(3, len(results)-1)]
        variations['V350'] = results[min(4, len(results)-1)]
        variations['V420'] = results[-1]
    
    return {
        'input': {'T0': T0, 'D0': D0, 'W_T0': W_T0, 'W_D0': W_D0},
        'all_iterations': results,
        'variations': variations,
        'final_parameters': {
            'theta': self.theta,
            'rho': self.rho,
            'lambda': self.lambda_limiter,
            'delta': self.delta
        }
    }
```

# Execute the algorithm

if **name** == “**main**”:
# Initialize algorithm
algo = SemanticDriftAlgorithm()

```
# Input variables (can be any term and definition)
T0 = "Feminine grotesque"
D0 = "Reclaiming the monstrous-feminine as site of power"

print("=== DYNAMIC SEMANTIC DRIFT ALGORITHM ===")
print(f"Input T₀: {T0}")
print(f"Input D₀: {D0}")
print()

# Run algorithm
results = algo.execute_algorithm(T0, D0)

# Display results
print("INPUT VARIABLES:")
print(f"W(T₀) = {results['input']['W_T0']}")
print(f"W(D₀) = {results['input']['W_D0']}")
print()

print("TRANSFORMATION SEQUENCE:")
for iteration in results['all_iterations']:
    i, Ti, Di, x, y, theta, rho = iteration
    print(f"Iteration {i}:")
    print(f"  Tᵢ = '{Ti}'")
    print(f"  Dᵢ = '{Di}'")
    print(f"  Distance constraint: {algo.calculate_distance(Ti, T0) + algo.calculate_distance(Di, D0):.3f} ≤ {2*y:.3f}")
    print(f"  Parameters: θ={theta:.3f}, ρ={rho:.3f}")
    print()

print("OUTPUT VARIATIONS V:")
for var_name, variation in results['variations'].items():
    if variation:
        i, Ti, Di, x, y, theta, rho = variation
        print(f"{var_name} = [{i}, '{Ti}', '{Di}', {x:.3f}, {y:.3f}, {theta:.3f}, {rho:.3f}]")

print()
print("ALGORITHM SUMMARY:")
print(f"Total iterations: {len(results['all_iterations'])}")
print(f"Final parameters: θ={results['final_parameters']['theta']:.3f}, "
      f"ρ={results['final_parameters']['rho']:.3f}")
print()
print("NOTE: Algorithm uses dynamic transformations - no hardcoded word associations")
print("Transformation methods: phonetic shifts, morphological variants, character-level mutations")
```
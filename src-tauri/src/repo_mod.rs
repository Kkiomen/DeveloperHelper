use regex::Regex;
use std::collections::HashSet;

pub fn prepare_words_to_find_files(message: &str) {
    // Utwórz wyrażenie regularne do rozdzielania na podstawie nie-alfanumerycznych znaków
    let re = Regex::new(r"\W+").unwrap();

    // Podziel tekst na słowa
    let words: HashSet<_> = re
        .split(message)
        .filter(|word| !word.is_empty()) // Pomijamy puste słowa
        .map(|word| word.to_string()) // Zamieniamy na String
        .collect(); // Dodajemy do HashSet

    // Wyświetl unikalne słowa
    println!("{:?}", words);
}

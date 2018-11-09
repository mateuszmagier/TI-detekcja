var type; // tablica rodzajów bitów
var dane; // tablica danych surowych
var coded_data; // tablica zakodowanych danych
var errors; // liczba błędów
var decoded_data; // 

/* zwraca tablicę INT zakodowanych danych */
function getEncodedData() {
    return coded_data;
}

/* zwraca dane zakodowane po korekcji
 * stosowana przy kodowaniu Hamminga, w celu
 * oddzielenia danych zakodowanych przed i po korekcji
 */
function getDecodedData() {
    return decoded_data;
}

/* zwraca tablicę INT rodzajów bitów */
function getTypesArray() {
    return type;
}

/* zwraca tablicę INT danych */
function getDane() {
    return dane;
}

/* zwraca całkowitą liczbę błędów */
function getErrorsNumber() {
    return errors;
}

/* inicjalizuje tablicę rodzajów bitów */
function initTypes() {
    for(var i = 0; i < type.length; i++)
        type[i] = 0;
}

/* zwraca tablicę INT danych losowych */
function prepareRandomData(n) { // parametr - liczba bitów do wygenerowania
    var dane = new Array(n);
    
    for(var i=0; i<n; i++) {
        dane[i] = Math.floor((Math.random() * 2));
    }
    
    return dane;
}

/* konwertuje tablicę INT danych losowych do łańcucha znaków */
function arrayToString(array) { // parametr - tablica INT
    var string = "";
    var n = array.length;
    
    for(var i=0; i<n; i++) {
        if(typeof(array[i]) !== 'undefined' && array[i] !== null) {
            string = string.concat(array[i].toString());
        }
        else { return string; }

    }
    
    return string;
}

/* konwertuje łańcuch znaków do tablicy INT */
function stringToArray(string) {
    var n = string.length;
    var dane = new Array(n);

    for(var i=0; i<n; i++) {
        dane[i] = parseInt(string[i]);
    }
    
    return dane;
}

/* 
 * zakłóca zakodowane dane, negując 'n' losowych bitów;
 * parametry: długość zakodowanych danych, liczba bitów do przekłamania 
 * 
 */
function interfereData(n) {
    var length = coded_data.length;
    if (n > length) n = length;
    var position, interfered_bits = 0;
    initTypes();
    
    while(interfered_bits < n) {
        position = Math.floor((Math.random() * length));
        if (type[position]==0) {
            if (coded_data[position]==1) 
                coded_data[position]=0;
            else 
                coded_data[position]=1;
            
            type[position]=1;
            interfered_bits++;
        }
    }
}

// zainicjuj liczbę błędów
function initErrors() {
    errors = 0;
}

/* 
 * zwraca liczbę bitów, o które różnią się pola "Zakodowane" nadawcy i odbiorcy
 * parametrami są tablice INT reprezentujące zawartości ww. pól
 * 
 */
function checkErrors(transmitter_encoded_data, receiver_encoded_data) {
    if(transmitter_encoded_data.length !== receiver_encoded_data.length)
        return -1;
    for(var i = 0; i < transmitter_encoded_data.length; i++) {
        if (transmitter_encoded_data[i] !== receiver_encoded_data[i])
            errors++;
    }
    return errors;
}

/* zwraca liczbę przesłanych bitów nadmiarowych */
function getRedundantBitsNumber() {
    return coded_data.length - dane.length;
}

/* zwraca liczbę błędów skorygowanych */
function getFixedErrorsNumber() {
    var fixed = 0;
    for (var i = 0; i < type.length; i++)
    {
            if (type[i]===1 || type[i]===4) fixed++;
    }
    return fixed;
}

/* zwraca nową wartość bitu; parametr - indeks bitu w kolekcji */
function negateBit(i) { 
    if(coded_data[i]==1) coded_data[i]=0;
    else coded_data[i]=1;
    
    if(type[i]==1) type[i]=0;
    else type[i]=1;
}
angular.module('APP', [])
    .controller('Controller', ControllerFunction);

function ControllerFunction($scope) {
    
    $scope.transmitter_bits_number = 8; // domyślna liczba bitów do wygenerowania
    $scope.receiver_bits_number = 1; // domyślna liczba bitów do zakłócenia
    $scope.method = 'parity'; // domyślna metoda
    $scope.bits_errors = '';
    
    
    /* wypełnia input przechowujący dane surowe */
    $scope.generateRandomData = function() {
        $scope.clearWhileChangingMethod();
        var random_data_array = prepareRandomData($scope.transmitter_bits_number); // tablica INT z danymi surowymi
        $scope.transmitter_random_data = arrayToString(random_data_array); // wypełnij input
    };
    
    // walidacja liczby bitów do wygenerowania
    $scope.checkBitsNumber = function() {
        if($scope.transmitter_bits_number%8 != 0 || $scope.transmitter_bits_number == null) {
            $scope.bits_errors = 'Liczba bitów powinna być podzielna przez 8.';
            return false;
        }
        else {
            $scope.bits_errors = '';
            return true;
        }
    };
    
    // walidacja danych wprowadzonych ręcznie
    $scope.checkBitsNumberFromInput = function() {
        if($scope.transmitter_random_data.length%8 != 0 || $scope.transmitter_random_data == '') {
            $scope.clearWhileChangingMethod();
            $scope.input_errors = 'Liczba bitów powinna być podzielna przez 8.';
            return false;
        }
        else {
            $scope.input_errors = '';
            return true;
        }
    };
    
    /* wypełnia input przechowujący dane zakodowane */
    $scope.encodeData = function() {
        var random_data_array = stringToArray($scope.transmitter_random_data); // tablica INT z danymi surowymi
        var encoded_data_array; // tablica INT z zakodowanymi danymi surowymi
        switch($scope.method) { // wybór metody w zależności od wartości radio button
            case 'parity':
                encoded_data_array = encodeParity(random_data_array); // zakoduj dane
                break;
            case 'hamming':
                encoded_data_array = encodeHamming(random_data_array);
                break;
            case 'crc':
                encoded_data_array = encodeCRC(random_data_array);
                break;
            default:
                alert('encode: nieznana metoda');
        }
        $scope.transmitter_encoded_data = arrayToString(encoded_data_array); // ustaw input z zakodowanymi danymi po stronie nadawcy
        $scope.encoded_data_array = encoded_data_array; // tablica INT ładowana do spanów w odbiorcy, w polu 'Zakodowane'
    };
    
    // generacja zakłóceń
    $scope.interfereEncodedData = function() {
        var bits_to_negate = $scope.receiver_bits_number; // liczba bitów przeznaczonych do zakłamania
        interfereData(bits_to_negate); // zaneguj 'bits_to_negate' losowych bitów
        $scope.clearWhileInterferencing();
    };
    
    // ręczne zakłócenie wybranego bitu
    $scope.manualInterference = function(id) {
        negateBit(id);
        $scope.clearWhileInterferencing();
    };
    
    // funkcja pomocnicza - ustawienie odpowiednich klas kolorów dla bitów po korekcji
    $scope.getClass = function(id) {
        var types = getTypesArray();
        switch(types[id]) {
            case 0:
                return "correct";
            case 1:
                return "incorrect";
            case 2:
                return "uncertain";
            case 3:
                return "correct-redundant";
            case 4:
                return "incorrect-redundant";
            case 5:
                return "uncertain-redundant";
            default:
                return "default-type";
        }
    };
    
    $scope.decodeData = function() {
        initErrors();
        // liczba błędów; w metodzie 'checkErrors' porównywane są pola 'Zakodowane' z nadawcy i odbiorcy
        var errors = checkErrors($scope.transmitter_encoded_data, arrayToString($scope.encoded_data_array));
        
        switch($scope.method) { // wybór metody korekcji
            case 'parity':
                fixParity();
                break;
            case 'hamming':
                fixHamming();
                break;
            case 'crc':
                fixCRC();
                break;
            default:
                alert('fix: nieznana metoda');
        }
        
        if($scope.method == 'parity' || $scope.method == 'crc')
            $scope.decoded_data_array = getEncodedData();
        else
            $scope.decoded_data_array = getDecodedData(); // rozdziel źródła dla kodowania Hamminga

        switch($scope.method) { // wybór metody dekodowania
            case 'parity':
                decodeParity();
                break;
            case 'hamming':
                decodeHamming();
                break;
            case 'crc':
                decodeCRC();
                break;
            default:
                alert('decode: nieznana metoda');
        }
        // ustaw dane dla widoku
        $scope.receiver_random_data = arrayToString(getDane());
        $scope.transferred_data_bits = getDane().length;
        $scope.redundant_data_bits = getRedundantBitsNumber();
        $scope.detected_errors = getErrorsNumber();
        $scope.fixed_errors = getFixedErrorsNumber();
        $scope.undetected_errors = errors - getErrorsNumber();
    };
    
    // debugowanie tablicy rodzajów bitów
    $scope.updateTypesArrayView = function() {
        $scope.types_array = arrayToString(getTypesArray());
    };
    
    // debugowanie tablicy zakodowanych danych
    $scope.updateCodedDataArrayView = function() {
        $scope.coded_data_array = arrayToString(getEncodedData());
    };
    
    // resetuj pola rezultatów
    $scope.clearSummary = function() {
        $scope.transferred_data_bits = '';
        $scope.redundant_data_bits = '';
        $scope.detected_errors = '';
        $scope.fixed_errors = '';
        $scope.undetected_errors = '';
    };
    
    // resetuj pola zw. z zakodowanymi danymi
    $scope.clearEncodedData = function() {
        $scope.transmitter_encoded_data = '';
        $scope.encoded_data_array = new Array();
        $scope.decoded_data_array = new Array();
    }
    
    // resetuj część pól podczas zakłócania
    $scope.clearWhileInterferencing = function() {
        $scope.decoded_data_array = new Array();
        $scope.receiver_random_data = '';
        $scope.clearSummary();
    }
    
    // resetuj część pól podczas zmiany metody
    $scope.clearWhileChangingMethod = function() {
        $scope.clearEncodedData();
        $scope.receiver_bits_number = 1;
        $scope.receiver_random_data = '';
        $scope.clearSummary();
    }
    
    // resetuj wszystkie pola
    $scope.reset = function() {
        $scope.transmitter_random_data = null;
        $scope.clearWhileChangingMethod();
    };
    
    // tablica przechowująca obiekty legendy
    $scope.comments = [
        {classname:'correct', meaning:'poprawny bit danych'},
        {classname:'incorrect', meaning:'przekłamany bit danych'},
        {classname:'uncertain', meaning:'niepewny bit danych'},
        {classname:'correct-redundant', meaning:'poprawny bit redundantny'},
        {classname:'incorrect-redundant', meaning:'przekłamany bit redundantny'},
        {classname:'uncertain-redundant', meaning:'niepewny bit redundantny'}
    ];
}


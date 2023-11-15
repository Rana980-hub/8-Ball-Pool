<?php

// Defined routes for the Custom MVC Framework

$router->get('/', 'GameController@index');
$router->get('/index.php', 'GameController@index');
$router->post('/save-score', 'GameController@saveScore');
$router->get('/scores', 'GameController@getScores');

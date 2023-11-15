<?php

namespace App\Core;

class Router
{
    private $routes = [];

    public function get($uri, $action)
    {
        $this->routes['GET'][$uri] = $action;
    }

    public function post($uri, $action)
    {
        $this->routes['POST'][$uri] = $action;
    }

    public function dispatch($uri, $method)
    {
        if (isset($this->routes[$method][$uri])) {
            $action = $this->routes[$method][$uri];
            
            if (is_callable($action)) {
                return call_user_func($action);
            }
            
            if (is_string($action)) {
                [$controller, $methodName] = explode('@', $action);
                $controllerClass = "App\\Http\\Controllers\\$controller";
                
                if (class_exists($controllerClass)) {
                    $controllerInstance = new $controllerClass();
                    if (method_exists($controllerInstance, $methodName)) {
                        return $controllerInstance->$methodName();
                    }
                }
            }
        }
        
        http_response_code(404);
        echo "404 Not Found";
    }
}

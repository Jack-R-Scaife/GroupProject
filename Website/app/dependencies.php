<?php

declare(strict_types=1);

use App\Application\Settings\SettingsInterface;
use DI\Container;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use Monolog\Processor\UidProcessor;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Slim\Views\PhpRenderer;

return function (Container $container) {
    $container->set(LoggerInterface::class, function (ContainerInterface $c) {
            $settings = $c->get(SettingsInterface::class);

            $loggerSettings = $settings->get('logger');
            $logger = new Logger($loggerSettings['name']);

            $processor = new UidProcessor();
            $logger->pushProcessor($processor);

            $handler = new StreamHandler($loggerSettings['path'], $loggerSettings['level']);
            $logger->pushHandler($handler);

            return $logger;
        });
    
    $container->set('renderer', function (ContainerInterface $c) {
        return new PhpRenderer(__DIR__ . '/../public/Views');
    });

    $container->set('db', function(ContainerInterface $c) {
        $db = $c->get(SettingsInterface::class)->get('db');
        try
        {
            $connection = new mysqli($db['hostname'],$db['username'],$db['password'],$db['schema']);
            return $connection;
        } catch(Exception $e) {
            return null;
        }
    });
};
<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit11e935e055e997f4ded389e93d4aaba5
{
    public static $files = array (
        '98a0c93b23cc12bd6783b5318e594b01' => __DIR__ . '/..' . '/afragen/add-plugin-dependency-api/add-plugin-dependency-api.php',
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->classMap = ComposerStaticInit11e935e055e997f4ded389e93d4aaba5::$classMap;

        }, null, ClassLoader::class);
    }
}
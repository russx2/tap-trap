-- phpMyAdmin SQL Dump
-- version 2.8.2
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: Sep 27, 2006 at 08:34 PM
-- Server version: 4.1.20
-- PHP Version: 5.1.4
-- 
-- Database: `samegame`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `games`
-- 

CREATE TABLE `games` (
  `id` int(11) NOT NULL auto_increment,
  `player_id` int(11) NOT NULL default '0',
  `seed` int(11) NOT NULL default '0',
  `processed` datetime NOT NULL default '0000-00-00 00:00:00',
  `ip` varchar(15) NOT NULL default '',
  `host` varchar(255) NOT NULL default '',
  `urlargs` varchar(255) NOT NULL default '',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=580 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `players`
-- 

CREATE TABLE `players` (
  `id` int(11) NOT NULL auto_increment,
  `uuid` varchar(255) NOT NULL default '',
  `joined` datetime NOT NULL default '0000-00-00 00:00:00',
  `ip` varchar(15) NOT NULL default '',
  `host` varchar(255) NOT NULL default '',
  `name` varchar(255) NOT NULL default '',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `u_player_uuid` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=244 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `scores`
-- 

CREATE TABLE `scores` (
  `game_id` int(11) NOT NULL default '0',
  `player_id` int(11) NOT NULL default '0',
  `score` int(11) NOT NULL default '0',
  `moves` text NOT NULL,
  `bonus` tinyint(4) NOT NULL default '0',
  `processed` datetime NOT NULL default '0000-00-00 00:00:00',
  PRIMARY KEY  (`game_id`),
  KEY `i_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Table structure for table `reminder`
--

CREATE TABLE `reminder` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(2047) COLLATE utf8_unicode_ci DEFAULT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `is_done` tinyint(1) NOT NULL DEFAULT 0,

  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

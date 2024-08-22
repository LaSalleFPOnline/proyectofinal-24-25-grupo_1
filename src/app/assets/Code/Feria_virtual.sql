-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 21-08-2024 a las 16:22:04
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `Feria_virtual`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `web_url` varchar(2083) DEFAULT NULL,
  `spot_url` varchar(2083) DEFAULT NULL,
  `logo_url` varchar(2083) DEFAULT NULL,
  `descripcion` varchar(5000) DEFAULT NULL,
  `url_meet` varchar(2083) DEFAULT NULL,
  `horario_meet` time DEFAULT NULL,
  `entidad` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `usuario_id`, `nombre_empresa`, `web_url`, `spot_url`, `logo_url`, `descripcion`, `url_meet`, `horario_meet`, `entidad`) VALUES
(1, 2, 'Implaser', 'www.silvia.com', '', 'https://www.centrosteco.com/wp-content/uploads/cache/images/teco-colegio-la-salle/teco-colegio-la-salle-3998433294.png', 'Hola, me llamo Silvia', 'www.meet.com', '00:00:00', 'Colegio 1'),
(2, 3, 'Altus', 'www.luismi.com', '', 'https://i.pinimg.com/736x/5e/2b/62/5e2b629e6e0bd4beeb39ade3f28a9620.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse consequat accumsan sapien sit amet viverra. Suspendisse dapibus elementum nunc non scelerisque. Aliquam eu elit magna. Aenean velit nulla, sollicitudin a mauris eget, aliquam faucibus risus. Vestibulum nulla felis, lobortis at nisl in, dapibus auctor neque. Nullam erat turpis, tempus vel posuere quis, porttitor quis lacus. Maecenas eleifend mi id consequat fringilla. Suspendisse tincidunt velit leo, eget dapibus quam ultricies eu. Nulla sit amet est convallis enim commodo vehicula. Quisque sodales condimentum urna vitae ullamcorper. Vestibulum molestie, ipsum ac faucibus tincidunt, metus est viverra turpis, ut fringilla nunc ligula vitae velit.', 'www.meet.com', '00:00:00', 'La Salle Santo Ángel'),
(3, 4, 'Art Boxes', 'www.marco.com', '', 'https://i.pinimg.com/originals/ee/ef/e0/eeefe09b587a8905dfa9f4868cbce741.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse consequat accumsan sapien sit amet viverra. Suspendisse dapibus elementum nunc non scelerisque. Aliquam eu elit magna. Aenean velit nulla, sollicitudin a mauris eget, aliquam faucibus risus. Vestibulum nulla felis, lobortis at nisl in, dapibus auctor neque. Nullam erat turpis, tempus vel posuere quis, porttitor quis lacus. Maecenas eleifend mi id consequat fringilla. Suspendisse tincidunt velit leo, eget dapibus quam ultricies eu. Nulla sit amet est convallis enim commodo vehicula. Quisque sodales condimentum urna vitae ullamcorper. Vestibulum molestie, ipsum ac faucibus tincidunt, metus est viverra turpis, ut fringilla nunc ligula vitae velit.', 'www.meet.com', '00:00:00', 'La Salle Gracia'),
(4, 5, 'Troqueles Lahuerta', 'www.jaime.com', '', 'https://i.pinimg.com/236x/0e/ff/1b/0eff1bab794ac6829754fb061385da0c.jpg', 'https://i.pinimg.com/236x/0e/ff/1b/0eff1bab794ac6829754fb061385da0c.jpg', 'www.meet.com', '00:00:00', 'La Salle Bonanova'),
(5, 6, NULL, 'www.pili.com', '', 'https://euronovios.es/wp-content/uploads/2017/04/Viajes-Zaragoza.jpg', '123456', 'www.meet.com', '17:50:00', 'Colegio 1'),
(6, 7, 'Comercial Edizar', 'www.ale.com', '', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjXXLjCE3p-VzsiobmJmQJX-YZC2ltFO56Uw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjXXLjCE3p-VzsiobmJmQJX-YZC2ltFO56Uw&s', 'www.meet.com', '00:00:00', 'La Salle Franciscanas'),
(7, 8, '', '', '', '', '', '', '00:00:00', ''),
(8, 9, 'Super Profe', 'www.santi.com', '', 'https://www.avanzaentucarrera.com/orientacion/comp/uploads/2017/12/ThinkstockPhotos-613759022.jpg', 'Hola soy Santi', 'www.meet.com', '17:39:00', 'La Salle');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` int(11) NOT NULL CHECK (`rol` in (1,2,3))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`) VALUES
(2, 'Implaser', 'silvia@email.com', '$2b$10$l3XuJJKotDe/Gn7Mz0SoneVo.L8uTLrZqkvbL3QdD.5tkuI1N8yJi', 1),
(3, 'Luismi', 'luismi@email.com', '$2b$10$YPbb3dNRd1UZPQlXdwlZ5.JeR5KsdZRqZnNcOWDQRvKQySBi.D9Di', 1),
(4, 'Marco', 'marco@email.com', '$2b$10$R5NGsvJjw6VtNJnM8fWKJ.uOAwMj4YunAiOwsG4/ASBH.xYYpZnzi', 1),
(5, 'Jaime', 'jaime@email.com', '$2b$10$Py.niWf4oJ.swIXn3rPt4OeQ9SHeGJHs0S.UkAbOGovDTSkzJn5mu', 1),
(6, 'Viajes Zaragoza AAA', 'pili@email.com', '$2b$10$rCGcSUs.q.AGSYYFO1MFS.DViaiYzjk5o83EHvAa76pkoUCxscGym', 1),
(7, 'Ale', 'ale@email.com', '$2b$10$Wyu9K1ehDQKjJp05bOuvOOqWNqmwCkUFs3QSxR30LVXTtt1jigCSS', 1),
(8, 'Pablo', 'pablo@email.com', '$2b$10$QR/SG10IzY8.Qg0UCbJIouwjuJkcs2Ek23j/cVLjao7dloqAck6o6', 1),
(9, 'Santi', 'santi@email.com', '$2b$10$DObYE.8ajA/PULR.OyPts.E7.6fIUEVRlh.nfv7ROOZZpI.4J9R7i', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `visitantes`
--

CREATE TABLE `visitantes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `entidad` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `visitantes`
--
ALTER TABLE `visitantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `visitantes`
--
ALTER TABLE `visitantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD CONSTRAINT `empresas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `visitantes`
--
ALTER TABLE `visitantes`
  ADD CONSTRAINT `visitantes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


INSERT INTO `agenda` (`id`, `hora`, `dia`, `descripcion`, `detalles`) VALUES
(1, '09:00:00', '2024-08-25', 'Inicio de la Feria', 'Comienza la I Feria de empresas simuladas La Salle Bussiness Match'),
(2, '20:00:00', '2024-08-25', 'Almuerzo', 'Almorzamos todos después de esta primera mañana. ¿Habéis hecho muchas relaciones comerciales?'),
(3, '09:00:00', '2024-08-25', 'Desayuno último día', 'Comienza el último día de esta feria. ¿Aprovechad para hacer las últimas relaciones y recordar votar para el concurso de empresas. ¡Ánimo en este nuevo día!'),
(4, '09:00:00', '2024-08-25', 'Clausura de la Feria', 'Terminamos la I Feria de empresas simuladas La Salle Bussiness Match. ¡Mucha suerte en el concurso de empresas! ¡¡Hasta la próxima!!');
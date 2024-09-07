-- DATOS TABLA DE AGENDA

INSERT INTO `agenda` (`id`, `horaI`, `horaF`, `descripcion`, `detalles`) VALUES
(1, '09:00:00', '09:14:59', 'Acto Inaugural', 'Con invitado institucional. ¡Más detalles, por favor!'),
(2, '09:15:00', '09:59:59', 'Emprender con...', 'Invitar a un emprendedor. ¡Más detalles, por favor!'),
(3, '10:00:00', '12:59:59', 'Feria Virtual', 'Sesión de mañana. ¡Ánimo en esas relaciones comerciales!'),
(4, '13:00:00', '15:29:59', 'Descanso', 'Hacemos un descanso para comer y volver con fuerzas'),
(5, '15:30:00', '18:29:59', 'Feria Virtual', 'Sesión de tarde. Recordar votar a la mejor empresa para el concurso. ¡Mucha suerte a todos!'),
(6, '18:30:00', '19:00:00', 'Clausura de la Feria', 'Anunciamos a las empresas ganadoras del concurso y terminamos la I Feria de empresas simuladas La Salle Bussiness Match. ¡¡Hasta la próxima!!');

-- DATOS TABLA USUARIOS

INSERT INTO `usuarios` (`id`, `email`, `password`, `rol`) VALUES
(1, 'silvia@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 1),
(2, 'santi@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 1),
(3, 'laura@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 1),
(4, 'luismi@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 1),
(5, 'marco@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 1),
(6, 'jaime@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 1),
(7, 'marta@email.com', '', 1),
(8, 'mina@email.com', '', 1),
(9, 'ale@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 2),
(10, 'pili@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 3);

-- DATOS TABLA EMPRESAS

INSERT INTO `empresas` (`id`, `usuario_id`, `nombre_empresa`, `web_url`, `spot_url`, `logo_url`, `descripcion`, `url_meet`, `horario_meet_morning_start`, `horario_meet_morning_end`,`horario_meet_afternoon_start`,`horario_meet_afternoon_end`,`entidad`) VALUES
(1, 1, 'Implaser', 'https://www.implaser.com/', '', 'https://www.implaser.com/wp-content/uploads/2019/03/empresa-saludable-1024x934-1.png', 'Implaser es una empresa líder en señalización y soluciones gráficas, especializada en la fabricación de señalización de seguridad, evacuación y accesibilidad. Con sede en Zaragoza, España, se destaca por su innovación y compromiso con la calidad, ofreciendo productos certificados y personalizados que cumplen con las normativas más exigentes. Implaser también apuesta por la sostenibilidad, utilizando materiales ecológicos y procesos de producción respetuosos con el medio ambiente.', 'https://meet.google.com/spu-czhw-tjt', '10:00:00', '11:00:00','17:00:00','17:30:00','La Salle Montemolín'),
(2, 2, 'Gimnasio Metropolitan', 'https://clubmetropolitan.com/', '', 'https://static.comunicae.com/photos/notas/1185524/1494239880_LOGO_METROPOLITAN.jpg', 'Club Metropolitan es una cadena líder de centros de fitness y bienestar en España. Ofrece una experiencia integral que combina gimnasio de alta gama, spa, y actividades dirigidas, todo en instalaciones modernas y elegantes. Con un enfoque en la salud y el bienestar, Metropolitan brinda servicios personalizados, incluyendo entrenadores personales y tratamientos de belleza. Es el destino ideal para quienes buscan mejorar su calidad de vida en un entorno exclusivo y sofisticado.', 'https://meet.google.com/bpq-yxhv-sgr', '09:00:00', '10:00:00','17:30:00','16:30:00', 'La Salle Lourdes'),
(3, 3, 'Universitat de Barcelona', 'https://web.ub.edu/inici', '', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZvIW8ij20hL7mr5vOmzQqE79PE7fnnvw-Q&s', 'La Universidad de Barcelona (UB) es una de las principales instituciones académicas de España y Europa, reconocida por su excelencia en docencia, investigación e innovación. Ofrece una amplia gama de grados, másteres y doctorados en diversas áreas del conocimiento. Con más de 560 años de historia, la UB combina tradición y modernidad, promoviendo un entorno académico dinámico y multicultural, comprometido con el desarrollo científico, cultural y social.', 'https://meet.google.com/iaj-zjeu-fon', '12:00:00', '12:30:00','18:00:00','19:00:00', 'La Salle Gràcia'),
(4, 4, 'Altus', 'https://wearealtus.com/es/', '', 'https://www.diffusionsport.com/wp-content/uploads/2024/05/altus_logo.jpg', 'Altus es una empresa líder en soluciones tecnológicas, especializada en consultoría, desarrollo de software y transformación digital. Con un enfoque en la innovación y la mejora continua, Altus trabaja con clientes de diversos sectores para optimizar sus procesos y potenciar su competitividad. Ofrece servicios personalizados que incluyen inteligencia artificial, Big Data, y automatización, ayudando a las empresas a adaptarse a un entorno digital en constante evolución.', 'https://meet.google.com/iym-eopc-ech', '08:00:00', '09:00:00','16:00:00','17:00:00', 'La Salle Santo Ángel'),
(5, 5, 'Bosch', 'https://www.bosch-home.es/', '', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_XVTY3LX2hcVX0gC4S1M35WNRwkkRSjiA7A&s', 'Bosch Home es una marca líder en electrodomésticos que combina tecnología avanzada con un diseño elegante y funcional. Parte del Grupo Bosch, la empresa ofrece una amplia gama de productos innovadores para el hogar, desde lavadoras y frigoríficos hasta soluciones de cocina y limpieza. Con un fuerte enfoque en la eficiencia energética y la sostenibilidad, Bosch Home se compromete a mejorar la calidad de vida de sus clientes mediante productos duraderos y de alto rendimiento.', 'https://meet.google.com/xut-dzgh-duc', '10:30:00', '11:00:00','16:30:00','18:00:00', 'La Salle Bonanova'),
(6, 6, 'Converzar', 'https://converzar.com/', 'https://youtu.be/IJkG-4cfnVg', 'https://redaccion.camarazaragoza.com/wp-content/uploads/2022/11/convezar-con-marco.png', 'Converzar es una innovadora plataforma que utiliza inteligencia artificial para mejorar la comunicación empresarial a través de chatbots y asistentes virtuales. Especializada en automatizar la atención al cliente, Converzar ofrece soluciones personalizadas que permiten a las empresas optimizar sus interacciones con los usuarios, mejorar la experiencia del cliente y aumentar la eficiencia operativa. Su tecnología avanzada facilita la integración y gestión de conversaciones en múltiples canales digitales.', 'https://meet.google.com/uia-spcs-cvq', '10:00:00', '12:00:00', '15:00:00', '16:00:00', 'La Salle Franciscanas');

-- DATOS TABLA ADMIN

INSERT INTO `administradores` (`id`, `usuario_id`) VALUES
(1, 10);

-- DATOS TABLA VISITANTES

INSERT INTO `visitantes` (`id`, `usuario_id`, `entidad`) VALUES
(1, 9, NULL);

-- DATOS TABLA RELACIONES COMERCIALES

INSERT INTO `intereses` (`id`, `empresa_id`, `empresa_interesada_id`, `created_at`) VALUES
(1, 1, 2, '2024-09-03 16:19:58'),
(2, 1, 6, '2024-09-03 16:20:08'),
(3, 1, 5, '2024-09-03 16:20:15'),
(4, 4, 1, '2024-09-03 16:20:54'),
(5, 6, 1, '2024-09-03 16:21:24'),
(6, 5, 1, '2024-09-03 16:21:50');

-- DATOS TABLA VOTACIONES

INSERT INTO `votaciones` (`id`, `usuario_id`, `empresa_id`, `voto`, `created_at`) VALUES
(1, 5, 1, 1, '2024-09-03 16:21:55'),
(2, 2, 1, 1, '2024-09-03 16:22:23'),
(3, 1, 3, 1, '2024-09-03 16:23:01');
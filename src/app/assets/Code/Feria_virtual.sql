-- DATOS TABLA DE AGENDA

INSERT INTO `agenda` (`id`, `horaI`, `horaF`, `descripcion`, `detalles`) VALUES
(1, '10:00:00', '11:00:00', 'Inicio de la Feria', 'Comienza la I Feria de empresas simuladas La Salle Bussiness Match'),
(2, '13:00:00', '14:00:00', 'Almuerzo', 'Almorzamos todos después de esta primera mañana. ¿Habéis hecho muchas relaciones comerciales?'),
(3, '18:00:00', '19:00:00', 'Desayuno último día', 'Comienza el último día de esta feria. ¿Aprovechad para hacer las últimas relaciones y recordar votar para el concurso de empresas. ¡Ánimo en este nuevo día!'),
(4, '21:00:00', '22:00:00', 'Clausura de la Feria', 'Terminamos la I Feria de empresas simuladas La Salle Bussiness Match. ¡Mucha suerte en el concurso de empresas! ¡¡Hasta la próxima!!');

-- DATOS TABLA USUARIOS

INSERT INTO `usuarios` (`id`, `email`, `password`, `rol`) VALUES
(1, 'silvia@email.com', '$2b$10$l3XuJJKotDe/Gn7Mz0SoneVo.L8uTLrZqkvbL3QdD.5tkuI1N8yJi', 1),
(2, 'luismi@email.com', '$2b$10$YPbb3dNRd1UZPQlXdwlZ5.JeR5KsdZRqZnNcOWDQRvKQySBi.D9Di', 1),
(3, 'marco@email.com', '$2b$10$R5NGsvJjw6VtNJnM8fWKJ.uOAwMj4YunAiOwsG4/ASBH.xYYpZnzi', 1),
(4, 'jaime@email.com', '$2b$10$Py.niWf4oJ.swIXn3rPt4OeQ9SHeGJHs0S.UkAbOGovDTSkzJn5mu', 1),
(5, 'pili@email.com', '$2b$10$rCGcSUs.q.AGSYYFO1MFS.DViaiYzjk5o83EHvAa76pkoUCxscGym', 1),
(6, 'ale@email.com', '$2b$10$Wyu9K1ehDQKjJp05bOuvOOqWNqmwCkUFs3QSxR30LVXTtt1jigCSS', 1),
(7, 'mina@email.com', '$2b$10$Wyu9K1ehDQKjJp05bOuvOOqWNqmwCkUFs3QSxR30LVXTtt1jigCSS', 1),
(8, 'santi@email.com', '$2b$10$DObYE.8ajA/PULR.OyPts.E7.6fIUEVRlh.nfv7ROOZZpI.4J9R7i', 1),
(9, 'laura@email.com', '$2b$10$DObYE.8ajA/PULR.OyPts.E7.6fIUEVRlh.nfv7ROOZZpI.4J9R7i', 2),
(10, 'marta@email.com', '$2b$10$DObYE.8ajA/PULR.OyPts.E7.6fIUEVRlh.nfv7ROOZZpI.4J9R7i', 3);

-- DATOS TABLA EMPRESAS

INSERT INTO `empresas` (`id`, `usuario_id`, `nombre_empresa`, `web_url`, `spot_url`, `logo_url`, `descripcion`, `url_meet`, `horario_meet`, `entidad`) VALUES
(1, 1, 'Implaser', 'www.silvia.com', '', 'https://www.centrosteco.com/wp-content/uploads/cache/images/teco-colegio-la-salle/teco-colegio-la-salle-3998433294.png', 'Hola, me llamo Silvia', 'www.meet.com', '00:00:00', 'Colegio 1'),
(2, 2, 'Altus', 'www.luismi.com', '', 'https://i.pinimg.com/736x/5e/2b/62/5e2b629e6e0bd4beeb39ade3f28a9620.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse consequat accumsan sapien sit amet viverra. Suspendisse dapibus elementum nunc non scelerisque. Aliquam eu elit magna. Aenean velit nulla, sollicitudin a mauris eget, aliquam faucibus risus. Vestibulum nulla felis, lobortis at nisl in, dapibus auctor neque. Nullam erat turpis, tempus vel posuere quis, porttitor quis lacus. Maecenas eleifend mi id consequat fringilla. Suspendisse tincidunt velit leo, eget dapibus quam ultricies eu. Nulla sit amet est convallis enim commodo vehicula. Quisque sodales condimentum urna vitae ullamcorper. Vestibulum molestie, ipsum ac faucibus tincidunt, metus est viverra turpis, ut fringilla nunc ligula vitae velit.', 'www.meet.com', '00:00:00', 'La Salle Santo Ángel'),
(3, 3, 'Art Boxes', 'www.marco.com', '', 'https://i.pinimg.com/originals/ee/ef/e0/eeefe09b587a8905dfa9f4868cbce741.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse consequat accumsan sapien sit amet viverra. Suspendisse dapibus elementum nunc non scelerisque. Aliquam eu elit magna. Aenean velit nulla, sollicitudin a mauris eget, aliquam faucibus risus. Vestibulum nulla felis, lobortis at nisl in, dapibus auctor neque. Nullam erat turpis, tempus vel posuere quis, porttitor quis lacus. Maecenas eleifend mi id consequat fringilla. Suspendisse tincidunt velit leo, eget dapibus quam ultricies eu. Nulla sit amet est convallis enim commodo vehicula. Quisque sodales condimentum urna vitae ullamcorper. Vestibulum molestie, ipsum ac faucibus tincidunt, metus est viverra turpis, ut fringilla nunc ligula vitae velit.', 'www.meet.com', '00:00:00', 'La Salle Gracia'),
(4, 4, 'Troqueles Lahuerta', 'www.jaime.com', '', 'https://i.pinimg.com/236x/0e/ff/1b/0eff1bab794ac6829754fb061385da0c.jpg', 'https://i.pinimg.com/236x/0e/ff/1b/0eff1bab794ac6829754fb061385da0c.jpg', 'www.meet.com', '00:00:00', 'La Salle Bonanova'),
(5, 5, 'Viajes Zaragoza', 'www.pili.com', '', 'https://euronovios.es/wp-content/uploads/2017/04/Viajes-Zaragoza.jpg', '123456', 'www.meet.com', '17:50:00', 'Colegio 1'),
(6, 6, 'Comercial Edizar', 'www.ale.com', '', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjXXLjCE3p-VzsiobmJmQJX-YZC2ltFO56Uw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjXXLjCE3p-VzsiobmJmQJX-YZC2ltFO56Uw&s', 'www.meet.com', '00:00:00', 'La Salle Franciscanas'),
(7, 7, 'Super Profe', 'www.santi.com', '', 'https://www.avanzaentucarrera.com/orientacion/comp/uploads/2017/12/ThinkstockPhotos-613759022.jpg', 'Hola soy Santi', 'www.meet.com', '17:39:00', 'La Salle');

-- DATOS TABLA ADMIN

INSERT INTO `administradores` (`id`, `usuario_id`) VALUES
(1, 10);

-- DATOS TABLA VISITANTES

INSERT INTO `visitantes` (`id`, `usuario_id`, `entidad`) VALUES
(1, 9, NULL);
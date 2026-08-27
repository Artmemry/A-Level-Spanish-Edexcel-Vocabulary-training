/* El Léxico — capa de género (gender layer)
   ─────────────────────────────────────────────────────────────────────
   El corpus guarda una sola forma: "el empleado". Sin esta capa, un
   alumno que escribe "la empleada" recibe un error, aunque su respuesta
   sea correcta.

   Esta capa NO se aplica a las listas. app.js genera la otra forma al
   vuelo cuando corrige, a partir de las reglas de abajo, y la acepta.
   Añadir un par irregular aquí lo activa en todo el corpus a la vez.

   · arts       — artículos que se emparejan (masculino, femenino)
   · suffixes   — terminaciones regulares (masculino, femenino)
   · invariable — terminaciones de género común: sólo cambia el artículo
   · pairs      — irregulares, escritos a mano
   · stops      — palabras tras las cuales ya no se concuerda el adjetivo
                  ("el empleado doméstico" concuerda; "el jefe de personal" no)
   ───────────────────────────────────────────────────────────────────── */
window.GENERO = {
  arts: [["el","la"],["un","una"],["los","las"],["unos","unas"]],

  suffixes: [
    ["o","a"],        // el empleado    → la empleada
    ["or","ora"],     // el trabajador  → la trabajadora
    ["és","esa"],     // el francés     → la francesa
    ["ín","ina"],     // el bailarín    → la bailarina
    ["án","ana"],     // el catalán     → la catalana
    ["ón","ona"],     // el campeón     → la campeona
    ["e","a"]         // el jefe        → la jefa   (ver invariable)
  ],

  invariable: ["ista","nte","al","ar","il","ense","able","ible","z"],

  pairs: [
    ["actor","actriz"],       ["alcalde","alcaldesa"],  ["barón","baronesa"],
    ["caballo","yegua"],      ["conde","condesa"],      ["duque","duquesa"],
    ["emperador","emperatriz"],["héroe","heroína"],     ["hombre","mujer"],
    ["marido","mujer"],       ["padre","madre"],        ["padrino","madrina"],
    ["poeta","poetisa"],      ["príncipe","princesa"],  ["rey","reina"],
    ["sacerdote","sacerdotisa"],["toro","vaca"],        ["varón","hembra"],
    ["yerno","nuera"],        ["caballero","dama"],     ["macho","hembra"]
  ],

  /* Pares que se escriben como un par de género pero significan cosas
     distintas: el puerto/la puerta, el modo/la moda. La regla no debe
     aceptarlos. Añade aquí cualquier falso par que encuentres — se
     bloquean los dos miembros. */
  excepciones: [
    ["puerto","puerta"],["modo","moda"],["banco","banca"],["suelo","suela"],
    ["bolso","bolsa"],["cuento","cuenta"],["punto","punta"],["ramo","rama"],
    ["palo","pala"],["plato","plata"],["libro","libra"],["caso","casa"],
    ["gorro","gorra"],["barco","barca"],["cesto","cesta"],
    ["huerto","huerta"],["leño","leña"],["madero","madera"],
    ["manto","manta"],["resto","resta"],["saco","saca"],["seto","seta"],
    ["velo","vela"],["anillo","anilla"],["bando","banda"],["bolo","bola"],
    ["brazo","braza"],["cero","cera"],["charco","charca"],
    ["cigarro","cigarra"],["copo","copa"],["cubo","cuba"],["foco","foca"],
    ["fruto","fruta"],["grano","grana"],["hoyo","hoya"],["huevo","hueva"],
    ["jarro","jarra"],["lomo","loma"],["marco","marca"],["mango","manga"],
    ["medio","media"],["naranjo","naranja"],["olivo","oliva"],
    ["palmo","palma"],["partido","partida"],["paso","pasa"],["pato","pata"],
    ["peso","pesa"],["pico","pica"],["pimiento","pimienta"],["pozo","poza"],
    ["rato","rata"],["ruedo","rueda"],["tallo","talla"],["tiro","tira"],
    ["trato","trata"],["tubo","tuba"],["zapato","zapata"],
    ["puesto","puesta"],["gasto","gasta"],["cargo","carga"],
    ["sueldo","suelda"],["derecho","derecha"],["período","perioda"],
    ["hombre","hombra"],["nombre","nombra"],["padre","padra"],
    ["madre","madro"],["clase","clasa"],["parte","parta"],["gente","genta"],
    ["noche","nocha"],["tarde","tarda"],["frente","frenta"],
    ["fuente","fuenta"],["muerte","muerta"],["suerte","suerta"],
    ["calle","calla"],["carne","carna"],["llave","llava"],["nave","nava"],
    ["sangre","sangra"],["costumbre","costumbra"],["cumbre","cumbra"],
    ["mano","mana"],["foto","fota"],["moto","mota"],["radio","radia"],
    ["día","dío"],["mapa","mapo"],["tema","temo"],["problema","problemo"],
    ["sistema","sistemo"],["programa","programo"],["idioma","idiomo"],
    ["clima","climo"],["agua","aguo"],["área","áreo"],["aula","aulo"]
  ],

  stops: ["de","del","a","al","en","con","sin","por","para","que","y","o","como"]
};

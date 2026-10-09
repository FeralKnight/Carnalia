export const TALENT_TIERS = ['Común', 'Poco común'];
export const talents = [
 {id:'iron_will',name:'Voluntad férrea',tier:'Común',description:'+7 vida, +1 resistencia.',stats:{hp:7,resistance:1}},
 {id:'quickstep',name:'Paso fugaz',tier:'Común',description:'+2 velocidad.',stats:{speed:2}},
 {id:'brutality',name:'Ímpetu',tier:'Común',description:'+2 daño, -1 defensa.',stats:{damage:2,defense:-1}},
 {id:'focus',name:'Foco interior',tier:'Común',description:'+3 energía, +1 resistencia.',stats:{energy:3,resistance:1}},
 {id:'endurance',name:'Tenacidad',tier:'Común',description:'+10 vida.',stats:{hp:10}},
 {id:'plating',name:'Piel endurecida',tier:'Común',description:'+2 defensa.',stats:{defense:2}},
 {id:'renewal',name:'Renovación',tier:'Poco común',description:'Recupera 2 vida al terminar la ronda.',stats:{},passives:[{trigger:'roundEnd',type:'heal',amount:2}]},
 {id:'battery',name:'Reserva interior',tier:'Poco común',description:'Recupera 1 energía adicional por ronda.',stats:{},passives:[{trigger:'roundEnd',type:'energy',amount:1}]},
 {id:'venom_touch',name:'Toque tóxico',tier:'Poco común',description:'Los golpes de arma aplican veneno 2 rondas.',stats:{},passives:[{trigger:'onHit',abilityTag:'weapon',type:'status',statusId:'poison',duration:2}]},
 {id:'bloodletting',name:'Herida abierta',tier:'Poco común',description:'Los golpes de arma aplican sangrado 2 rondas.',stats:{},passives:[{trigger:'onHit',abilityTag:'weapon',type:'status',statusId:'bleed',duration:2}]},
 {id:'balanced',name:'Equilibrio',tier:'Poco común',description:'+1 daño, defensa, velocidad y resistencia.',stats:{damage:1,defense:1,speed:1,resistance:1}},
 {id:'deep_reserve',name:'Pulso arcano',tier:'Poco común',description:'+6 energía, -2 vida.',stats:{energy:6,hp:-2}}
];

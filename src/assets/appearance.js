// Presentation data only. IDs map directly to appearances, independently of stats.
export const raceLooks = Object.freeze(Object.fromEntries([
 ['human','#c49479','#372a35','#dfb96f','human'],
 ['emberkin','#68515f','#ef784e','#ffcc70','ember'],
 ['race_2','#dcb99c','#f0d99a','#e5c466','sunelf'],
 ['race_3','#aba4d2','#dde8ee','#a7c8ee','moonelf'],
 ['race_4','#bb8364','#904c36','#e2b168','dwarf'],
 ['race_5','#75947a','#273b35','#dcce8c','orc'],
 ['race_6','#508c89','#254e58','#ffcb72','dragon'],
 ['race_7','#b46684','#291b39','#f1b782','tiefling'],
 ['race_8','#e8cbb1','#fff2cc','#ffe8a5','angel'],
 ['race_9','#c4bacd','#1f2137','#fa7f95','vampire'],
 ['race_10','#aa8b79','#493c41','#e5be6a','wolf'],
 ['race_11','#8aad69','#335b42','#edd190','goblin'],
 ['race_12','#9fa2ad','#d1d0dc','#dfac7c','giant'],
 ['race_13','#8a9ea8','#34465b','#6bebec','machine'],
 ['race_14','#89afbe','#cfdee6','#a0eff1','ghost'],
 ['race_15','#72b6bb','#304c87','#88e3dc','siren'],
 ['race_16','#d3b6c9','#b783c6','#d3ffa1','fae'],
 ['race_17','#bd9e87','#755564','#d4df8d','chimera'],
 ['race_18','#705d86','#eddbef','#db9ce7','drow'],
 ['race_19','#82a48b','#2e554e','#f3d691','reptile']
].map(([id,skin,hair,accent,shape])=>[id,{skin,hair,accent,shape}])));

export const classLooks = Object.freeze(Object.fromEntries([
 ['vanguard','plate','#53677d','#b9c9ce','shield'],
 ['arcanist','robe','#655493','#c8a3ef','star'],
 ['class_2','coat','#315d74','#7bc8df','rapier'],
 ['class_3','hood','#43374f','#aa85b9','crescent'],
 ['class_4','fur','#89483f','#ed986e','fang'],
 ['class_5','plate','#eee0bd','#e7bd6c','sun'],
 ['class_6','robe','#354354','#86d4ba','skull'],
 ['class_7','robe','#526e4a','#b7cd75','leaf'],
 ['class_8','wrap','#b98257','#edcea1','circle'],
 ['class_9','coat','#557762','#a7d29b','arrow'],
 ['class_10','coat','#847349','#e2d384','flask'],
 ['class_11','robe','#875284','#e5a3dd','diamond'],
 ['class_12','plate','#5a7c82','#9ecbd1','tower'],
 ['class_13','coat','#946184','#eabcaa','music'],
 ['class_14','wrap','#47647c','#b3cfdf','blades'],
 ['class_15','coat','#563840','#daa188','cross'],
 ['class_16','hood','#493d71','#ac94dd','eye'],
 ['class_17','fur','#767a50','#c9c58b','spiral'],
 ['class_18','plate','#83899b','#c4ccd7','crown'],
 ['class_19','robe','#3f888e','#9be4e2','flame'],
 ['class_20','plate','#697958','#c2d496','spear'],
 ['class_21','coat','#5d3d51','#e3bd85','anchor'],
 ['class_22','coat','#886843','#efc77e','gear'],
 ['class_23','plate','#d1bf9d','#f3dda6','cross'],
 ['class_24','robe','#5c7c91','#b1e4ec','eye'],
 ['class_25','hood','#453f57','#bba5ce','scythe'],
 ['class_26','plate','#556967','#a9c9b6','tower'],
 ['class_27','wrap','#954f46','#e8b6a2','fist'],
 ['class_28','robe','#766796','#d1beee','mirror'],
 ['class_29','coat','#786549','#dfc793','hourglass']
].map(([id,cut,main,trim,symbol])=>[id,{cut,main,trim,symbol}])));

export const weaponLooks = Object.freeze({
 rust_sword:{shape:'sword',metal:'#efa7a2',shade:'#854355',accent:'#e99383'},
 azure_sword:{shape:'sword',metal:'#bde7f0',shade:'#437892',accent:'#7be6ed'},
 ember_staff:{shape:'staff',metal:'#976045',shade:'#453c52',accent:'#ffb55a'},
 stone_axe:{shape:'axe',metal:'#bfcbd2',shade:'#596a7d',accent:'#dfb483'},
 poison_dagger:{shape:'dagger',metal:'#c4efb0',shade:'#50816b',accent:'#b5ee65'},
 blood_sword:{shape:'serrated',metal:'#e8bbc5',shade:'#792c4b',accent:'#df7196'},
 fire_blade:{shape:'flaming',metal:'#ffd39b',shade:'#af5a48',accent:'#ff9d57'},
 crystal_staff:{shape:'crystal',metal:'#667ea5',shade:'#33415f',accent:'#abe4f4'},
 duelist_blade:{shape:'rapier',metal:'#e3e1c9',shade:'#79768b',accent:'#e9c36c'}
});
export const armorLooks = Object.freeze({
 leather_armor:{cut:'leather',main:'#976958',trim:'#d7ad7c'},
 iron_armor:{cut:'plate',main:'#788ea3',trim:'#c8d8e4'},
 ember_armor:{cut:'mantle',main:'#81465c',trim:'#efac7d'},
 guardian_plate:{cut:'heavy',main:'#465b76',trim:'#a9c3d7'},
 silk_robe:{cut:'silk',main:'#5b6798',trim:'#d4beea'},
 hunter_coat:{cut:'leather',main:'#4a756a',trim:'#b8d2ac'}
});

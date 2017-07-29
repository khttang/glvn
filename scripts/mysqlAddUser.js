'use strict';

var procedures = require("../modules/users/server/mysql/admin.procedures");

var users = [
    { usertype: 'TEACHER', username: 'khiemtang', password: '~Khtt0911', roles: 'ADMIN-a', canLogin: true, fullName: 'Khiem Tang', email: 'khttang@gmail.com' },
    { usertype: 'TEACHER', username: 'testadmin', password: '@dm1n', roles: 'ADMIN', canLogin: true, fullName: 'Khiem Tang', email: 'khttang@gmail.com' },
    { usertype: 'TEACHER', username: 'sarah', password: 'fontanelle', roles: 'ADMIN', canLogin: true, fullName: 'Sarah Nguyen', email: 'sarahnguyen@hotmail.com' },
    { usertype: 'TEACHER', username: 'hanhnguyen', password: 'nguyenhanh', roles: 'ADMIN', canLogin: true, fullName: 'Hanh Nguyen', email: 'hanhnguyen0714@gmail.com' },
    { usertype: 'TEACHER', username: 'hanhvu', password: 'longridge', roles: 'ADMIN', canLogin: true, fullName: 'Hanh Vu', email: 'hanhvu02@yahoo.com' },
    { usertype: 'TEACHER', username: 'catherine.tran', password: 'falcon', roles: 'ADMIN', canLogin: true, fullName: 'Phuong Tran', email: 'ceciliaphuong14@gmail.com' },
    { usertype: 'TEACHER', username: 'nghianguyen', password: 'hieunghia', roles: 'ADMIN', canLogin: true, fullName: 'Hieu Nguyen', email: 'hieunghia@sbcglobal.net' },
    { usertype: 'TEACHER', username: 'dp100022', password: '1234xyas', roles: 'ADMIN', canLogin: true, fullName: 'Anthony Pham', email: 'anthony.pham.11590@gmail.com' },
    { usertype: 'TEACHER', username: 'lanhuong', password: 'kamwood', roles: 'ADMIN', canLogin: true, fullName: 'Lan-Huong Quach', email: 'lanhuong_quach@yahoo.com' },
    { usertype: 'TEACHER', username: 'rogertran', password: 'peacewithyou777', roles: 'ADMIN', canLogin: true, fullName: 'Roger Tran', email: 'peacewithyou777@gmail.com' },
    { usertype: 'TEACHER', username: 'andrenguyen', password: '8213Westm0re', roles: 'ADMIN', canLogin: true, fullName: 'Andre Nguyen', email: 'andrenguyen123@yahoo.com' }
];

users.forEach(function(user) {
    procedures.addAdminUser(user);
});


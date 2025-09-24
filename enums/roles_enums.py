from enum import Enum

#esta clase nos sirve para identificar los roles de los usuarios
class RoleEnum(Enum):
    ADMIN = 'admin'
    TOURIST = 'tourist'
    RECEPCIONIST = 'recepcionist'
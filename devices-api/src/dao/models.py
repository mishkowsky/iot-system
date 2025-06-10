import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from src.dao.database import Base
from src.metrics_api_wrapper.metrics_api import get_device_latest_metric


class DeviceType(str, enum.Enum):
    bulb = 'bulb'
    sensor = 'sensor'


class Floor(Base):
    __tablename__ = 'floors'
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer)
    name = Column(String, nullable=False)
    rooms = relationship('Room', back_populates='floor', cascade='all, delete')


class Device(Base):
    __tablename__ = 'devices'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(DeviceType), nullable=False)

    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=True)

    room = relationship('Room', back_populates='devices')

    __mapper_args__ = {
        'polymorphic_identity': 'devices',
        'polymorphic_on': type
    }


class Room(Base):
    __tablename__ = 'rooms'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_illuminance = Column(Integer, default=500)
    floor_id = Column(Integer, ForeignKey('floors.id'))
    start_time = Column(DateTime)
    end_time = Column(DateTime)

    floor = relationship('Floor', back_populates='rooms')
    devices = relationship('Device', back_populates='room', order_by=Device.name)

    @property
    def devices_polymorphic(self):
        return self.devices

    # attendee = relationship(
    #     "Attendee",
    #     backref=backref(
    #         'large_group_attendance',
    #         order_by=Attendee.__table__.columns.id
    #     )
    # )

    # def __init__(self, **kwargs):
    #     super().__init__(kwargs)


class Sensor(Device):
    __tablename__ = 'sensors'
    id = Column(None, ForeignKey('devices.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_load': 'selectin',
        'polymorphic_identity': 'sensor'
    }

    @property
    def illuminance(self):
        return get_device_latest_metric("value", self.id)


class Bulb(Device):
    __tablename__ = 'bulbs'
    id = Column(None, ForeignKey('devices.id'), primary_key=True)
    is_on = Column(Boolean, default=False)
    luminous_efficiency = Column(Integer)
    power = Column(Integer)

    __mapper_args__ = {
        'polymorphic_load': 'selectin',
        'polymorphic_identity': 'bulb'
    }

    @property
    def brightness(self):
        return get_device_latest_metric("value", self.id)

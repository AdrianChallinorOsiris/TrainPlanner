"""Track class for controlling track power sections."""

from enum import Enum
from train_control.config import constants
import train_control.config.settings as settings
from train_control.config.settings import LED_status
import train_control.leds.Led as leds
import logging

# We just assume we are running on the Pi and go ahead with importing the libioplus and lib8relind libraries.
import libioplus as iop
import lib8relind as relay8



class Direction(Enum):
    """Direction of travel for a track."""
    OFF = "OFF"
    FWD = "FWD"
    BCK = "BCK"


class Track:
    """Class for controlling track power sections using open drain PWM."""
    
    def __init__(self, id: int, relayStack: int, relay: int, pwmStack: int, pwmId: int, settings_instance=None):
        """
        Initialize Track.
        
        Args:
            id: Track ID number
            relayStack: Stack ID, an integer in the range 0-7
            relay: Relay number, an integer in the range 1-8
            pwmStack: PWM Stack ID, an integer in the range 0-7
            pwmId: PWM ID, an integer in the range 1-4
            settings_instance: Optional Settings instance to access LED objects
            
        Raises:
            ValueError: If any parameter values are out of valid range
        """
        if not isinstance(relayStack, int) or relayStack < 0 or relayStack > 7:
            raise ValueError(f"RelayStack must be an integer in the range 0-7, got {relayStack}")
        
        if not isinstance(relay, int) or relay < 1 or relay > 8:
            raise ValueError(f"Relay must be an integer in the range 1-8, got {relay}")
        
        if not isinstance(pwmStack, int) or pwmStack < 0 or pwmStack > 7:
            raise ValueError(f"PwmStack must be an integer in the range 0-7, got {pwmStack}")
        
        if not isinstance(pwmId, int) or pwmId < 1 or pwmId > 4:
            raise ValueError(f"PwmId must be an integer in the range 1-4, got {pwmId}")
            
        self.logger = logging.getLogger(__name__)
    
        self.relayStack = relayStack
        self.relay = relay
        self.pwmStack = pwmStack
        self.pwmId = pwmId
        self.current_speed = 0
        self.direction = Direction.OFF
        self.held = False
        self.held_reason = None
        self.track_id = id
        self.id = f'T{id:02d}'
        
        # Calculate GPIO pin for red LED: LED_RED_BASE + track_id
        gpio_pin = constants.LED_RED_BASE + id
        if settings_instance:
            self.led = settings_instance.get_led(gpio_pin)
        else:
            self.led = None

        # Always set both relays to off
        relay8.set(self.relayStack, self.relay, 0)
        relay8.set(self.relayStack, self.relay+1, 0)
        
        # Always set the PWM to 0
        iop.setOdPwm(self.pwmStack, self.pwmId, 0)
    
    def hold(self, held: bool, reason: str = None) -> None:
        """Set the held state and stop the track.
        
        Args:
            held: Boolean value to set the held state to
        """
        if held:    
            # Always set both relays to off and PWM to off
            relay8.set(self.relayStack, self.relay, 0)
            relay8.set(self.relayStack, self.relay+1, 0)
            iop.setOdPwm(self.pwmStack, self.pwmId, 0)
            self.set_led_status(LED_status.BLINK)
            self.held = True
            self.held_reason = reason
        else:
            self.set_led_status(LED_status.ON)
            self.held = False
            self.held_reason = None
    
    def set_direction(self, direction: Direction) -> None:
        """
        Set the direction of the track. Can set the direction, which 
        will be logged but ignored if held.
        
        Args:
            direction: Direction of travel (FWD, BCK, or OFF)
        """
        
        match direction:
            case Direction.FWD:
                relay8.set(self.relayStack, self.relay, 0)
                relay8.set(self.relayStack, self.relay+1, 1)
                self.set_led_status(LED_status.ON)
            case Direction.BCK:
                relay8.set(self.relayStack, self.relay, 1)
                relay8.set(self.relayStack, self.relay+1, 0)
                self.set_led_status(LED_status.ON)
            case Direction.OFF:
                relay8.set(self.relayStack, self.relay, 0)
                relay8.set(self.relayStack, self.relay+1, 0)
                self.set_led_status(LED_status.OFF)
    
    def stop(self) -> None:
        """Stop the track."""
        # Always set both relays to off and the PWM to 0
        relay8.set(self.relayStack, self.relay, 0)
        relay8.set(self.relayStack, self.relay+1, 0)
        iop.setOdPwm(self.pwmStack, self.pwmId, 0)
        self.current_speed = 0
        self.set_led_status(LED_status.OFF)

    def speed(self, speed: int, direction: Direction) -> None:
        """Set the speed and direction of the track.
        
        Args:
            speed: Speed value (0-100)
            direction: Direction of travel
            
        Raises:
            ValueError: If speed is not in the range 0-100
        """
        if not isinstance(speed, int) or speed < 0 or speed > 100:
            raise ValueError(f"Speed must be an integer between 0 and 100, got {speed}")
        
        if self.held:
            self.logger.info(f"Track {self.id} is held, not setting speed or direction")
            return
        
        self.set_direction(direction)

        # TODO: implement the acceleration and deceleration    
        # set the PWM speed
        iop.setOdPwm(self.pwmStack, self.pwmId, speed)
        self.current_speed = speed
        self.direction = direction

    def set_led_status(self, state: LED_status) -> None:
        """Set the status of an LED.
        
        Args:
            state: LED status (ON, OFF, or BLINK)
        """
        if self.led is None:
            self.logger.warning(f"LED not initialized for track {self.id}")
            return
            
        match state:
            case LED_status.ON:
                self.led.on()
            case LED_status.OFF:
                self.led.off()
            case LED_status.BLINK:
                self.led.blink()
    
    def set_led_from_settings(self, settings_instance) -> None:
        """Set the LED object from a Settings instance.
        
        Args:
            settings_instance: Settings instance to get LED from
        """
        gpio_pin = constants.LED_RED_BASE + self.track_id
        self.led = settings_instance.get_led(gpio_pin)

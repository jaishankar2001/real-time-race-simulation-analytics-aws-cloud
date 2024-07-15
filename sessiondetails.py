import mmap
import struct
import math
import time
import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import matplotlib.image as mpimg


def convertDegreeArcToPercent(value):
    return max(value/360, 0)
class AssettoCorsaData(object):
        def __init__(self):
            print('AssettoCorsaData() init()')
            self.physics_fields = ['packetId', 'throttle', 'brake', 'fuel', 'gear', 'rpm', 'steerAngle', 'speed', 'velocity1', 'velocity2', 'velocity3',
                                    'accGX', 'accGY', 'accGZ', 'wheelSlipFL', 'wheelSlipFR', 'wheelSlipRL', 'wheelSlipRR', 'wheelLoadFL', 'wheelLoadFR',
                                    'wheelLoadRL', 'wheelLoadRR', 'wheelsPressureFL', 'wheelsPressureFR', 'wheelsPressureRL', 'wheelsPressureRR', 'wheelAngularSpeedFL',
                                    'wheelAngularSpeedFR', 'wheelAngularSpeedRL', 'wheelAngularSpeedRR', 'TyrewearFL', 'TyrewearFR', 'TyrewearRL', 'TyrewearRR', 'tyreDirtyLevelFL'
                                    'tyreDirtyLevelFR', 'tyreDirtyLevelRL', 'tyreDirtyLevelRR', 'TyreCoreTempFL', 'TyreCoreTempFR', 'TyreCoreTempRL', 'TyreCoreTempRR',
                                    'camberRADFL', 'camberRADFR', 'camberRADRL', 'camberRADRR', 'suspensionTravelFL', 'suspensionTravelFR', 'suspensionTravelRL', 'suspensionTravelRR',
                                    'drs', 'tc1', 'heading', 'pitch', 'roll', 'cgHeight', 'carDamagefront', 'carDamagerear', 'carDamageleft', 'carDamageright', 'carDamagecentre',
                                    'numberOfTyresOut', 'pitLimiterOn', 'abs1', 'kersCharge', 'kersInput', 'automat', 'rideHeightfront', 'rideHeightrear', 'turboBoost', 'ballast',
                                    'airDensity', 'airTemp', 'roadTemp', 'localAngularVelX', 'localAngularVelY', 'localAngularVelZ', 'finalFF', 'performanceMeter', 'engineBrake', 
                                    'ersRecoveryLevel', 'ersPowerLevel', 'ersHeatCharging', 'ersIsCharging', 'kersCurrentKJ', 'drsAvailable', 'drsEnabled', 'brakeTempFL',
                                    'brakeTempFR', 'brakeTempRL', 'brakeTempRR', 'clutch', 'tyreTempI1', 'tyreTempI2', 'tyreTempI3', 'tyreTempI4', 'tyreTempM1', 'tyreTempM2',
                                    'tyreTempM3', 'tyreTempM4', 'tyreTempO1', 'tyreTempO2', 'tyreTempO3', 'tyreTempO4', 'isAIControlled', 'tyreContactPointFLX', 'tyreContactPointFLY',
                                    'tyreContactPointFLZ', 'tyreContactPointFRX', 'tyreContactPointFRY', 'tyreContactPointFRZ', 'tyreContactPointRLX', 'tyreContactPointRLY', 
                                    'tyreContactPointRLZ', 'tyreContactPointRRX', 'tyreContactPointRRY', 'tyreContactPointRRZ', 'tyreContactNormalFLX', 'tyreContactNormalFLY', 
                                    'tyreContactNormalFLZ', 'tyreContactNormalFRX', 'tyreContactNormalFRY', 'tyreContactNormalFRZ', 'tyreContactNormalRLX', 'tyreContactNormalRLY',
                                    'tyreContactNormalRLZ', 'tyreContactNormalRRX', 'tyreContactNormalRRY', 'tyreContactNormalRRZ', 'tyreContactHeadingFLX', 'tyreContactHeadingFLY',
                                    'tyreContactHeadingFLZ', 'tyreContactHeadingFRX', 'tyreContactHeadingFRY', 'tyreContactHeadingFRZ', 'tyreContactHeadingRLX', 'tyreContactHeadingRLY',
                                    'tyreContactHeadingRLZ', 'tyreContactHeadingRRX', 'tyreContactHeadingRRY', 'tyreContactHeadingRRZ', 'brakeBias', 'localVelocityX', 'localVelocityY',
                                    'localVelocityZ']
            #self.physics_layout = 'ifffiiffffffff 4f fffffffffffffffffffffffffffffffffffffffffffiifffiffffffffffffiiiiifiifffffffffffffffffiffffffffffffffffffffffffffffffffffffffffiifffffffffffffffffffffiifffffffffffffiiffffffff'
            self.physics_layout = '<ifffiifffffffffffffffffffffffffffffffffffffffffffffffffffiifffiffffffffffffiiiiifiifffffffffffffffffiffffffffffffffffffffffffffffffffffffffff'
            self.static_fields = [
                'smVersion', 'acVersion', 'numberOfSessions', 'numCars', 'carModel', 'track',
                'playerName', 'playerSurname', 'playerNick', 'sectorCount', 'maxTorque', 'maxPower',
                'maxRpm', 'maxFuel', 'suspensionMaxTravelFL','suspensionMaxTravelFR', 'suspensionMaxTravelRL', 'suspensionMaxTravelRR',
                'tyreRadiusFL', 'tyreRadiusFR', 'tyreRadiusRL', 'tyreRadiusRR', 'maxTurboBoost',
                'deprecated_1', 'deprecated_2', 'penaltiesEnabled', 'aidFuelRate', 'aidTireRate',
                'aidMechanicalDamage', 'aidAllowTyreBlankets', 'aidStability', 'aidAutoClutch',
                'aidAutoBlip', 'hasDRS', 'hasERS', 'hasKERS', 'kersMaxJ', 'engineBrakeSettingsCount',
                'ersPowerControllerCount', 'trackSPlineLength', 'trackConfiguration', 'ersMaxJ',
                'isTimedRace', 'hasExtraLap', 'carSkin', 'reversedGridPositions', 'PitWindowStart',
                'PitWindowEnd']
            self.static_layout = '<30s 30s i i 66s 66s 66s 66s 68s i f f i f f f f f f f f f f f f i f f f i f i i i i i f i i f 66s f i i 66s i i i'
            self.graphic_fields = [
                'packetId', 'status', 'session', 'currentTime', 'lastTime', 'bestTime', 'split', 'completedLaps', 'position',
                'iCurrentTime', 'iLastTime', 'iBestTime', 'sessionTimeLeft', 'distanceTraveled', 'isInPit', 'currentSectorIndex',
                'lastSectorTime', 'numberOfLaps', 'tyreCompound', 'replayTimeMultiplier', 'normalizedCarPosition', 'carCoordinatesX', 'carCoordinatesY', 'carCoordinatesZ',
                'penaltyTime', 'flag', 'idealLineOn', 'isInPitLane', 'surfaceGrip', 'mandatoryPitDone', 'windSpeed', 'windDirection']
            self.graphic_layout = '<i i i 30s 30s 30s 30s i i i i i f f i i i i 66s f f f f f f i i i f i f f'

            self.physics_shm_size = struct.calcsize(self.physics_layout)
            self.static_shm_size = struct.calcsize(self.static_layout) 
            self.grahic_shm_size = struct.calcsize(self.graphic_layout)
            print(self.static_shm_size, self.physics_shm_size, self.grahic_shm_size) # Adjust this size based on the actual static memory layout

            self.mmapPhysic = None
            self.mmapStatic = None
            self.mmapGraphic = None

        def start(self):
            print('AssettoCorsaData() start()')
            if not self.mmapGraphic:
                self.mmapGraphic = mmap.mmap(-1, self.grahic_shm_size, "Local\\acpmf_graphics",  access=mmap.ACCESS_READ)
            if not self.mmapPhysic:
                self.mmapPhysic = mmap.mmap(-1, self.physics_shm_size, "Local\\acpmf_physics",  access=mmap.ACCESS_READ)
            if not self.mmapStatic:
                self.mmapStatic = mmap.mmap(-1, self.static_shm_size, "Local\\acpmf_static",  access=mmap.ACCESS_READ)
            
        def getData(self):
            self.mmapPhysic.seek(0)
            rawData = self.mmapPhysic.read(self.physics_shm_size)
            data = {}
            for index, value in enumerate(struct.unpack(self.physics_layout, rawData)):
                data[self.physics_fields[index]] = value

            #self._convertData(data)
            return data

        def getJsonData(self):
            return json.dumps(self.getData())
        
        

        def getStaticData(self):
            self.mmapStatic.seek(0)            
            rawData = self.mmapStatic.read(self.static_shm_size)
            print(len(rawData))
            data = {}
            unpacked_data = struct.unpack(self.static_layout, rawData)
            for index, value in enumerate(unpacked_data):
                field_name = self.static_fields[index]  # Assuming self.static_fields contains the names of fields
                if isinstance(value, bytes):
                    value = value.decode('utf-16').rstrip('\x00')
                #print(f"Processing field '{field_name}': value = {value}")
                data[field_name] = value
            return data

        def getGraphicData(self):
            self.mmapGraphic.seek(0)          
            rawData = self.mmapGraphic.read(self.grahic_shm_size)
            data = {}
            unpacked_data = struct.unpack(self.graphic_layout, rawData)
            for index, value in enumerate(unpacked_data):
                field_name = self.graphic_fields[index]  # Assuming self.static_fields contains the names of fields
                if isinstance(value, bytes):
                    value = value.decode('utf-16').rstrip('\x00')
                #print(f"Processing field '{field_name}': value = {value}")
                data[field_name] = value
            return data
        
        def stop(self):
            print('AssettoCorsaData() stop()')
            if self.mmapPhysic:
                self.mmapPhysic.close()
            if self.mmapStatic:
                self.mmapStatic.close()

            self.mmapPhysic = None
            self.mmapStatic = None

        def _convertData(self, data):
            # TODO make these conversions immediately when reading from shm
            for newName in ['wheelSlip', 'wheelLoad', 'wheelsPressure',
                    'brakeTemp', 'brakePressure', 'Tyrewear', 'wheelAngularSpeed',
                    'padLife', 'discLife', 'camberRAD', 'TyreCoreTemp', 'tyreDirtyLevel',
                    'suspensionTravel']:
                data[newName] = []
                for oldName in [newName + 'FL', newName+'FR', newName+'RL', newName+'RR']:
                    data[newName].append(convertDegreeArcToPercent(data[oldName]))
                    del data[oldName]

if __name__ == '__main__':
    assettoReader = AssettoCorsaData()
    assettoReader.start()
    duration = 2 * 60 + 6
    data = []
    #print('Static data:', assettoReader.getStaticData())
    dist = []
    x = []
    y = []
    z = []
    start_time = time.time()
    while True:
        #print('Assetto data:', assettoReader.getData())
        data = assettoReader.getData()
        #print('Graphic Data:', data['carCoordinatesX'], data['carCoordinatesY'], data['carCoordinatesZ'])
        #print('Normalized', data['normalizedCarPosition'])
    
        # Assuming frames is your dictionary with coordinates
        #dist.append(data['distanceTraveled'])
        x.append((data['tyreContactPointFLX']+data['tyreContactPointFRX']+data['tyreContactPointRLX']+data['tyreContactPointRRX'])/4)
        y.append((data['tyreContactPointFLY']+data['tyreContactPointFRY']+data['tyreContactPointRLY']+data['tyreContactPointRRY'])/4)
        z.append((data['tyreContactPointFLZ']+data['tyreContactPointFRZ']+data['tyreContactPointRLZ']+data['tyreContactPointRRZ'])/4)

        elapsed_time = time.time() - start_time
        if elapsed_time >= duration:
            break
        time.sleep(0.2)
    print(data)
    #print(dist)
    #print(max(dist))
    #print(min(dist))
    img = mpimg.imread('map copy.png')
    rotated_img = np.rot90(img)

    fig, ax = plt.subplots(figsize=(10, 8))

    # Display the image
    ax.imshow(rotated_img, extent=[-980, 680, -224, 1060])

    # Plot y-x on top of the image
    ax.plot(x, y, linestyle='-', color='blue')

    # Set labels and title
    ax.set_xlabel('X-axis')
    ax.set_ylabel('Y-axis')
    ax.set_title('Y-X Plot Overlaid on Map')

    # Show the plot
    plt.show()
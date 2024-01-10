import { Body, Controller, Param, Post, Get, Put, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxySuperFlights } from 'src/common/proxy/client.proxy';
import { FlightDTO } from './dto/flight.dto';
import { IFlight } from 'src/common/interfaces/flight.interface';
import { FlightsMSG, PassengerMSG } from 'src/common/constants';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('flights')
@UseGuards(JwtAuthGuard)
@Controller('api/v2/flight')
export class FlightController {
    constructor(
        private readonly clientProxy: ClientProxySuperFlights
    ) { }

    private _clientProxyFligth = this.clientProxy.clientProxyFlights()
    private _clientProxyPassenger = this.clientProxy.clientProxyPassengers()

    @Post()
    create(@Body() flightDTO: FlightDTO): Observable<IFlight> {
        return this._clientProxyFligth.send(FlightsMSG.CREATE, flightDTO)
    }

    @Get()
    findAll(): Observable<IFlight[]> {
        return this._clientProxyFligth.send(FlightsMSG.FIND_ALL, '')
    }

    @Get(':id')
    findOne(@Param('id') id: string): Observable<IFlight> {
        return this._clientProxyFligth.send(FlightsMSG.FIND_ONE, id)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() flightDTO: FlightDTO): Observable<IFlight> {
        return this._clientProxyFligth.send(FlightsMSG.UPDATE, { id, flightDTO })
    }

    @Delete(':id')
    delete(@Param('id') id: string): Observable<any> {
        return this._clientProxyFligth.send(FlightsMSG.DELETE, id)
    }

    @Post(':flightId/passenger/:passengerId')
    async addPassenger(
        @Param('flightId') flightId: string,
        @Param('passengerId') passengerId: string,
    ) {
        const passenger = await this._clientProxyPassenger.send(PassengerMSG.FIND_ONE, passengerId)
            .toPromise()
            
        if (!passenger)
            throw new HttpException('Passenger Not Found', HttpStatus.NOT_FOUND);

        return this._clientProxyFligth.send(FlightsMSG.ADD_PASSENGER, flightId)

    }
}

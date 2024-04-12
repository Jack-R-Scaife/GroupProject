<?php
declare(strict_types=1);

namespace App\Application\Actions\Rule;

use App\Application\Actions\AdminAction;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Exception\HttpMethodNotAllowedException;

class CreateRoomTimeRuleAction extends AdminAction
{

    protected function action(): Response
    {
        $data = $this->request->getParsedBody();

        // Validation checks
        if (!isset($data['roomId'], $data['beginTimeslot'], $data['endTimeslot'], $data['day']))
            throw new HttpBadRequestException($this->request, "Invalid form data submitted");
        if (!is_numeric($data['roomId']) || !is_numeric($data['beginTimeslot']) || !is_numeric($data['endTimeslot']))
            throw new HttpBadRequestException($this->request, "Invalid form data submitted");

        $roomId = (int)$data['roomId'];
        $begin = (int)$data['beginTimeslot'];
        $end = (int)$data['endTimeslot'];
        $day = $data['day'];

        //Pre-database timeslot range validation to give users useful errors
        //TODO: The useful error messages... @ErrorHandling
        if($begin < 0 || $end < 0 || $begin>95 || $end>95 || $begin>$end)
            throw new HttpBadRequestException($this->request, "Invalid form data submitted");
        
        $id = $this->db->createRoomTimeRule($this->houseId, $roomId, $day, $begin, $end);
        if($id === false)
            return $this->createJsonResponse($this->response, 'Rule creation failed', 500);

        return $this->createJsonDataResponse($this->response, $id, false);
    }
}

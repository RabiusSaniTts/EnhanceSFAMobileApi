<?php
class SimpleXLS
{
    private $data = array();

    public function addRow($row)
    {
        $this->data[] = $row;
    }

    public function render($filename = "export.xls")
    {
        header("Content-Type: application/vnd.ms-excel");
        header("Content-Disposition: attachment; filename=\"$filename\"");
        header("Pragma: no-cache");
        header("Expires: 0");

        // BOF
        echo pack("ssssss", 0x809, 0x8, 0x0, 0x10, 0x0, 0x0);

        foreach ($this->data as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $this->xlsWriteLabel($rowIndex, $colIndex, $value);
            }
        }

        // EOF
        echo pack("ss", 0x0A, 0x00);
        exit();
    }

    private function xlsWriteLabel($Row, $Col, $Value)
    {
        $L = strlen($Value);
        echo pack("ssssss", 0x204, 8 + $L, $Row, $Col, 0x0, $L);
        echo $Value;
    }
}

?>
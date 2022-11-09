import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { TextField } from '@mui/material';

interface DateSelectorProps {
  value: string;
  allowSameDateSelection?: boolean;
  onChangeDateSelector: any;
  onChange: any;
  className: string;
  error?: boolean;
  helperText?: string;
  maxDate?: any;
  minDate?: any;
  label?: string;
  autoComplete?: string;
  fontSize?: number;
  width?: string;
  labelColor?: string;
}

const DateSelector = (props: DateSelectorProps) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                value={props.value}
        
                allowSameDateSelection={props.allowSameDateSelection || true}
                onChange={props.onChangeDateSelector}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        onChange={props.onChange}
                        className={props.className}
                        error={props.error}
                        helperText={props.error ? props.helperText : ''}
                        style={{
                            backgroundColor: '#f4f5f8',
                            width: props.width ? props.width: '100%',
                        }}
                        inputProps={{
                            ...params.inputProps,
                            placeholder: "mm/dd/yyyy"
                          }}
                        autoComplete={props.autoComplete}
                        InputLabelProps={{
                          style: { fontSize: props.fontSize, color: props.labelColor },
                        }}
                    />
                )}
                maxDate={props.maxDate || null}
                minDate={props.minDate || null}
                label={props.label || ''}
            />
        </LocalizationProvider>
    );
};

export default DateSelector;

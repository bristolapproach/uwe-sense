PROJECT_NAME := hrs

export OUTPUT_FILENAME
#MAKEFILE_NAME := $(CURDIR)/$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
MAKEFILE_NAME := $(MAKEFILE_LIST)
MAKEFILE_DIR := $(dir $(MAKEFILE_NAME) )

LINKER_SCRIPT=ble_app_hrs_freertos_gcc_nrf52.ld
TEMPLATE_PATH = $(NORDIC_SDK_ROOT)/components/toolchain/gcc
ifeq ($(OS),Windows_NT)
include $(TEMPLATE_PATH)/Makefile.windows
else
include $(TEMPLATE_PATH)/Makefile.posix
endif

MK := mkdir
RM := rm -rf

#echo suspend
ifeq ("$(VERBOSE)","1")
NO_ECHO :=
else
NO_ECHO := @
endif

# Toolchain commands
CC              := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-gcc'
AS              := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-as'
AR              := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-ar' -r
LD              := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-ld'
NM              := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-nm'
OBJDUMP         := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-objdump'
OBJCOPY         := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-objcopy'
SIZE            := '$(GNU_INSTALL_ROOT)/bin/$(GNU_PREFIX)-size'

#function for removing duplicates in a list
remduplicates = $(strip $(if $1,$(firstword $1) $(call remduplicates,$(filter-out $(firstword $1),$1))))

# PATHs for mergehex and softdevice
MERGEHEX = $(NORDIC_SDK_ROOT)/../bin/mergehex
S132_SOFTDEVICE = $(NORDIC_SDK_ROOT)/components/softdevice/s132/hex/s132_nrf52_3.0.0_softdevice.hex

# Path for MK20 mount for MBED install, Red Bear Nano setup
MK20_PATH = /Volumes/MBED

#source common to all targets
C_SOURCE_FILES += \
$(NORDIC_SDK_ROOT)/components/libraries/log/src/nrf_log_backend_serial.c \
$(NORDIC_SDK_ROOT)/components/libraries/log/src/nrf_log_frontend.c \
$(NORDIC_SDK_ROOT)/components/libraries/button/app_button.c \
$(NORDIC_SDK_ROOT)/components/libraries/util/app_error.c \
$(NORDIC_SDK_ROOT)/components/libraries/util/app_error_weak.c \
$(NORDIC_SDK_ROOT)/components/libraries/timer/app_timer_freertos.c \
$(NORDIC_SDK_ROOT)/components/libraries/util/app_util_platform.c \
$(NORDIC_SDK_ROOT)/components/libraries/crc16/crc16.c \
$(NORDIC_SDK_ROOT)/components/libraries/fds/fds.c \
$(NORDIC_SDK_ROOT)/components/libraries/fstorage/fstorage.c \
$(NORDIC_SDK_ROOT)/components/libraries/hardfault/nrf52/handler/hardfault_handler_gcc.c \
$(NORDIC_SDK_ROOT)/components/libraries/hardfault/hardfault_implementation.c \
$(NORDIC_SDK_ROOT)/components/libraries/util/nrf_assert.c \
$(NORDIC_SDK_ROOT)/components/libraries/util/sdk_errors.c \
$(NORDIC_SDK_ROOT)/components/libraries/util/sdk_mapped_flags.c \
$(NORDIC_SDK_ROOT)/components/libraries/sensorsim/sensorsim.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/croutine.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/event_groups.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/portable/MemMang/heap_1.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/list.c \
$(NORDIC_SDK_ROOT)/external/freertos/portable/GCC/nrf52/port.c \
$(NORDIC_SDK_ROOT)/external/freertos/portable/CMSIS/nrf52/port_cmsis.c \
$(NORDIC_SDK_ROOT)/external/freertos/portable/CMSIS/nrf52/port_cmsis_systick.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/queue.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/tasks.c \
$(NORDIC_SDK_ROOT)/external/freertos/source/timers.c \
$(NORDIC_SDK_ROOT)/components/boards/boards.c \
$(NORDIC_SDK_ROOT)/components/drivers_nrf/clock/nrf_drv_clock.c \
$(NORDIC_SDK_ROOT)/components/drivers_nrf/common/nrf_drv_common.c \
$(NORDIC_SDK_ROOT)/components/drivers_nrf/gpiote/nrf_drv_gpiote.c \
$(NORDIC_SDK_ROOT)/components/drivers_nrf/uart/nrf_drv_uart.c \
$(NORDIC_SDK_ROOT)/components/libraries/bsp/bsp.c \
$(NORDIC_SDK_ROOT)/components/libraries/bsp/bsp_btn_ble.c \
$(NORDIC_SDK_ROOT)/components/libraries/bsp/bsp_nfc.c \
./main.c \
./ble_controller.c \
$(NORDIC_SDK_ROOT)/external/segger_rtt/RTT_Syscalls_GCC.c \
$(NORDIC_SDK_ROOT)/external/segger_rtt/SEGGER_RTT.c \
$(NORDIC_SDK_ROOT)/external/segger_rtt/SEGGER_RTT_printf.c \
$(NORDIC_SDK_ROOT)/components/ble/common/ble_advdata.c \
$(NORDIC_SDK_ROOT)/components/ble/ble_advertising/ble_advertising.c \
$(NORDIC_SDK_ROOT)/components/ble/common/ble_conn_params.c \
$(NORDIC_SDK_ROOT)/components/ble/common/ble_conn_state.c \
$(NORDIC_SDK_ROOT)/components/ble/common/ble_srv_common.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/gatt_cache_manager.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/gatts_cache_manager.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/id_manager.c \
$(NORDIC_SDK_ROOT)/components/ble/nrf_ble_gatt/nrf_ble_gatt.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/peer_data.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/peer_data_storage.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/peer_database.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/peer_id.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/peer_manager.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/pm_buffer.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/pm_mutex.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/security_dispatcher.c \
$(NORDIC_SDK_ROOT)/components/ble/peer_manager/security_manager.c \
$(NORDIC_SDK_ROOT)/components/toolchain/system_nrf52.c \
$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_bas/ble_bas.c \
$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_dis/ble_dis.c \
$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_hrs/ble_hrs.c \
$(NORDIC_SDK_ROOT)/components/softdevice/common/softdevice_handler/softdevice_handler.c \


#assembly files common to all targets
ASM_SOURCE_FILES  = $(NORDIC_SDK_ROOT)/components/toolchain/gcc/gcc_startup_nrf52.S

#includes common to all targets

INC_PATHS += -I./config \
-I$(NORDIC_SDK_ROOT)/components/libraries/util \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/comp \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/twi_master \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_ancs_c \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_ias_c \
-I$(NORDIC_SDK_ROOT)/components/libraries/pwm \
-I$(NORDIC_SDK_ROOT)/components/softdevice/s132/headers/nrf52 \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/cdc/acm \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/hid/generic \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/msc \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/hid \
-I$(NORDIC_SDK_ROOT)/components/libraries/log \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_gls \
-I$(NORDIC_SDK_ROOT)/components/libraries/fstorage \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/i2s \
-I$(NORDIC_SDK_ROOT)/components/libraries/gpiote \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/gpiote \
-I$(NORDIC_SDK_ROOT)/components/boards \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/common \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_advertising \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/adc \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_bas_c \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_hrs_c \
-I$(NORDIC_SDK_ROOT)/components/libraries/queue \
-I$(NORDIC_SDK_ROOT)/external/freertos/portable/GCC/nrf52 \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_dtm \
-I$(NORDIC_SDK_ROOT)/components/toolchain/cmsis/include \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_rscs_c \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/uart \
-I$(NORDIC_SDK_ROOT)/components/ble/common \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_lls \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/wdt \
-I$(NORDIC_SDK_ROOT)/components/libraries/hardfault/nrf52 \
-I$(NORDIC_SDK_ROOT)/components/libraries/bsp \
-I$(NORDIC_SDK_ROOT)/external/freertos/config \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_bas \
-I$(NORDIC_SDK_ROOT)/components/libraries/experimental_section_vars \
-I$(NORDIC_SDK_ROOT)/components/softdevice/s132/headers \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_ans_c \
-I$(NORDIC_SDK_ROOT)/components/libraries/slip \
-I$(NORDIC_SDK_ROOT)/components/libraries/mem_manager \
-I$(NORDIC_SDK_ROOT)/external/segger_rtt \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/cdc \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/hal \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_nus_c \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/rtc \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_ias \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/hid/mouse \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/ppi \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_dfu \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/twis_slave \
-I$(NORDIC_SDK_ROOT)/components \
-I$(NORDIC_SDK_ROOT)/components/libraries/scheduler \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_lbs \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_hts \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/delay \
-I$(NORDIC_SDK_ROOT)/components/libraries/crc16 \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/timer \
-I$(NORDIC_SDK_ROOT)/components/libraries/util \
-I$(NORDIC_SDK_ROOT)/external/freertos/portable/CMSIS/nrf52 \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/pwm \
-I$(NORDIC_SDK_ROOT)/components/libraries/csense_drv \
-I$(NORDIC_SDK_ROOT)/components/libraries/csense \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/rng \
-I$(NORDIC_SDK_ROOT)/components/libraries/low_power_pwm \
-I$(NORDIC_SDK_ROOT)/components/libraries/hardfault \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_cscs \
-I$(NORDIC_SDK_ROOT)/components/libraries/uart \
-I$(NORDIC_SDK_ROOT)/components/libraries/hci \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/hid/kbd \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/spi_slave \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/lpcomp \
-I$(NORDIC_SDK_ROOT)/components/libraries/timer \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/power \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/config \
-I$(NORDIC_SDK_ROOT)/components/toolchain \
-I$(NORDIC_SDK_ROOT)/components/libraries/led_softblink \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/qdec \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_cts_c \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/spi_master \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_nus \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_hids \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/pdm \
-I$(NORDIC_SDK_ROOT)/components/libraries/crc32 \
-I$(NORDIC_SDK_ROOT)/external/freertos/source/include \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd/class/audio \
-I$(NORDIC_SDK_ROOT)/components/libraries/sensorsim \
-I$(NORDIC_SDK_ROOT)/components/ble/peer_manager \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/swi \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_tps \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_dis \
-I$(NORDIC_SDK_ROOT)/components/device \
-I$(NORDIC_SDK_ROOT)/components/ble/nrf_ble_gatt \
-I$(NORDIC_SDK_ROOT)/components/ble/nrf_ble_qwr \
-I$(NORDIC_SDK_ROOT)/components/libraries/button \
-I$(NORDIC_SDK_ROOT)/components/libraries/usbd \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/saadc \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_lbs_c \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_racp \
-I$(NORDIC_SDK_ROOT)/components/toolchain/gcc \
-I$(NORDIC_SDK_ROOT)/components/libraries/fds \
-I$(NORDIC_SDK_ROOT)/components/libraries/twi \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/clock \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_rscs \
-I$(NORDIC_SDK_ROOT)/components/drivers_nrf/usbd \
-I$(NORDIC_SDK_ROOT)/components/softdevice/common/softdevice_handler \
-I$(NORDIC_SDK_ROOT)/components/ble/ble_services/ble_hrs \
-I$(NORDIC_SDK_ROOT)/components/libraries/log/src \

OBJECT_DIRECTORY = _build
LISTING_DIRECTORY = $(OBJECT_DIRECTORY)
OUTPUT_BINARY_DIRECTORY = $(OBJECT_DIRECTORY)

# Sorting removes duplicates
BUILD_DIRECTORIES := $(sort $(OBJECT_DIRECTORY) $(OUTPUT_BINARY_DIRECTORY) $(LISTING_DIRECTORY) )

# C flags common to all targets
CFLAGS += -D__STACK_SIZE=2048
CFLAGS += -DNRF52
CFLAGS += -DNRF52_PAN_64
CFLAGS += -DSOFTDEVICE_PRESENT
CFLAGS += -DBOARD_UWE_SENSE
CFLAGS += -DNRF52832
CFLAGS += -D__HEAP_SIZE=1024
CFLAGS += -DNRF52_PAN_12
CFLAGS += -DNRF52_PAN_58
CFLAGS += -DNRF52_PAN_54
CFLAGS += -DNRF52_PAN_31
CFLAGS += -DNRF52_PAN_51
CFLAGS += -DNRF52_PAN_36
CFLAGS += -DFREERTOS
CFLAGS += -DCONFIG_GPIO_AS_PINRESET
CFLAGS += -DBLE_STACK_SUPPORT_REQD
CFLAGS += -DNRF52_PAN_15
CFLAGS += -DNRF_SD_BLE_API_VERSION=3
CFLAGS += -DNRF52_PAN_55
CFLAGS += -DNRF52_PAN_20
CFLAGS += -DS132
CFLAGS += -mcpu=cortex-m4
CFLAGS += -mthumb -mabi=aapcs
CFLAGS +=  -Wall -O3 -g3
CFLAGS += -mfloat-abi=hard -mfpu=fpv4-sp-d16
# keep every function in separate section, this allows linker to discard unused ones
CFLAGS += -ffunction-sections -fdata-sections -fno-strict-aliasing
CFLAGS += -fno-builtin --short-enums


## Assembler flags common to all targets
ASMFLAGS += -x assembler-with-cpp
ASMFLAGS += -D__STACK_SIZE=2048
ASMFLAGS += -DNRF52
ASMFLAGS += -DNRF52_PAN_64
ASMFLAGS += -DSOFTDEVICE_PRESENT
ASMFLAGS += -DBOARD_PCA10040
ASMFLAGS += -DNRF52832
ASMFLAGS += -D__HEAP_SIZE=1024
ASMFLAGS += -DNRF52_PAN_12
ASMFLAGS += -DNRF52_PAN_58
ASMFLAGS += -DNRF52_PAN_54
ASMFLAGS += -DNRF52_PAN_31
ASMFLAGS += -DNRF52_PAN_51
ASMFLAGS += -DNRF52_PAN_36
ASMFLAGS += -DFREERTOS
ASMFLAGS += -DCONFIG_GPIO_AS_PINRESET
ASMFLAGS += -DBLE_STACK_SUPPORT_REQD
ASMFLAGS += -DNRF52_PAN_15
ASMFLAGS += -DNRF_SD_BLE_API_VERSION=3
ASMFLAGS += -DNRF52_PAN_55
ASMFLAGS += -DNRF52_PAN_20
ASMFLAGS += -DS132

# Linker flags
LDFLAGS += -mthumb -mabi=aapcs -L $(TEMPLATE_PATH) -T$(LINKER_SCRIPT)
LDFLAGS += -mcpu=cortex-m4
LDFLAGS += -mfloat-abi=hard -mfpu=fpv4-sp-d16
# let linker to dump unused sections
LDFLAGS += -Wl,--gc-sections
# use newlib in nano version
LDFLAGS += --specs=nano.specs -lc -lnosys

#default target - first one defined
default: clean hrs_s132

#building all targets
all: clean
	$(NO_ECHO)$(MAKE) -f $(MAKEFILE_NAME) -C $(MAKEFILE_DIR) -e cleanobj
	$(NO_ECHO)$(MAKE) -f $(MAKEFILE_NAME) -C $(MAKEFILE_DIR) -e hrs_s130

#target for printing all targets
help:
	@echo following targets are available:
	@echo 	hrs_s132
	@echo   flash_mk20

C_SOURCE_FILE_NAMES = $(notdir $(C_SOURCE_FILES))
C_PATHS = $(call remduplicates, $(dir $(C_SOURCE_FILES) ) )
C_OBJECTS = $(addprefix $(OBJECT_DIRECTORY)/, $(C_SOURCE_FILE_NAMES:.c=.o) )

ASM_SOURCE_FILE_NAMES = $(notdir $(ASM_SOURCE_FILES))
ASM_PATHS = $(call remduplicates, $(dir $(ASM_SOURCE_FILES) ))
ASM_OBJECTS = $(addprefix $(OBJECT_DIRECTORY)/, $(ASM_SOURCE_FILE_NAMES:.S=.o) )

vpath %.c $(C_PATHS)
vpath %.S $(ASM_PATHS)

OBJECTS = $(C_OBJECTS) $(ASM_OBJECTS)

hrs_s132: OUTPUT_FILENAME := hrs_s132
hrs_s132: LINKER_SCRIPT=ble_app_hrs_freertos_gcc_nrf52.ld

hrs_s132: $(BUILD_DIRECTORIES) $(OBJECTS)
	@echo Linking target: $(OUTPUT_FILENAME).out
	$(NO_ECHO)$(CC) -Wl,-Map=$(@:.out=.map) $(LDFLAGS) $(OBJECTS) $(LIBS) -lm -o $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out
	$(NO_ECHO)$(MAKE) -f $(MAKEFILE_NAME) -C $(MAKEFILE_DIR) -e finalize

## Create build directories
$(BUILD_DIRECTORIES):
	echo $(MAKEFILE_NAME)
	$(MK) $@

# Create objects from C SRC files
$(OBJECT_DIRECTORY)/%.o: %.c
	@echo Compiling file: $(notdir $<)
	$(NO_ECHO)$(CC) $(CFLAGS) $(INC_PATHS) -c -o $@ $<

# Assemble files
$(OBJECT_DIRECTORY)/%.o: %.S
	@echo Assembly file: $(notdir $<)
	$(NO_ECHO)$(CC) $(ASMFLAGS) $(INC_PATHS) -c -o $@ $<
# Link
$(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out: $(BUILD_DIRECTORIES) $(OBJECTS)
	@echo Linking target: $(OUTPUT_FILENAME).out
	$(NO_ECHO)$(CC) $(LDFLAGS) $(OBJECTS) $(LIBS) -lm -o $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out
## Create binary .bin file from the .out file
$(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).bin: $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out
	@echo Preparing: $(OUTPUT_FILENAME).bin
	$(NO_ECHO)$(OBJCOPY) -O binary $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).bin

## Create binary .hex file from the .out file
$(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).hex: $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out
	@echo Preparing: $(OUTPUT_FILENAME).hex
	$(NO_ECHO)$(OBJCOPY) -O ihex $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).hex

finalize: genhex mergehex

genbin:
	@echo Preparing: $(OUTPUT_FILENAME).bin
	$(NO_ECHO)$(OBJCOPY) -O binary $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).bin

## Create binary .hex file from the .out fileclear
genhex:
	@echo Preparing: $(OUTPUT_FILENAME).hex
	$(NO_ECHO)$(OBJCOPY) -O ihex $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).hex

## For Bear Lab's MK20, no softdevice on board so we need to include it!
mergehex: $(OUTPUT_BINARY_DIRECTORY)/hrs_s132.hex
	@echo Merging s132 softdevice with $<
	$(MERGEHEX) --merge $(S132_SOFTDEVICE) $< --output $(OUTPUT_BINARY_DIRECTORY)/hrs_s132_merged.hex

echosize:
	-@echo ''
	$(NO_ECHO)$(SIZE) $(OUTPUT_BINARY_DIRECTORY)/$(OUTPUT_FILENAME).out
	-@echo ''

clean:
	$(RM) $(BUILD_DIRECTORIES)

cleanobj:
	$(RM) $(BUILD_DIRECTORIES)/*.o

flash: hrs_s132
	@echo Flashing: $(OUTPUT_BINARY_DIRECTORY)/$<.hex
	$(NORDIC_SDK_ROOT)../nrfjprog/nrfjprog --program $(OUTPUT_BINARY_DIRECTORY)/$<.hex -f nrf52  --sectorerase
	$(NORDIC_SDK_ROOT)../nrfjprog/nrfjprog --reset -f nrf52

## Flash softdevice
flash_softdevice:
	@echo Flashing: s132_nrf52_3.0.0_softdevice.hex
	$(NORDIC_SDK_ROOT)../nrfjprog/nrfjprog --program $(S132_SOFTDEVICE) -f nrf52 --chiperase
	$(NORDIC_SDK_ROOT)../nrfjprog/nrfjprog --reset -f nrf52

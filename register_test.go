package oracle

import (
	"context"
	_ "embed"
	"runtime"
	"testing"
	"time"
	// "fmt"

	"github.com/grafana/xk6-sql/sqltest"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

//go:embed testdata/script.js
var script string

// adapted from https://developers.ascendcorp.com/how-to-use-testcontainers-for-go-with-oracle-db-4d0b12fbaffe
func TestIntegration(t *testing.T) { //nolint:paralleltest
	if testing.Short() {
		t.Skip()
	}

	if runtime.GOOS != "linux" {
		t.Skip("Works only on Linux (Testcontainers)")
	}

	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		Image:        "gvenzl/oracle-free:latest",
		ExposedPorts: []string{"1521/tcp"},
		Env: map[string]string{
			"ORACLE_PASSWORD": "mypassword",
		},
		WaitingFor: wait.ForLog("DATABASE IS READY TO USE!").WithStartupTimeout(time.Minute * 5),
	}

	genericContainerReq := testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	}

	// Create a new Oracle DB container
	oracleContainer, err := testcontainers.GenericContainer(ctx, genericContainerReq)

	if err != nil {
		t.Fatalf("Failed to create Oracle DB container: %v", err)
	}

	// host, err := oracleContainer.Host(ctx)
	// if err != nil {
	// 	t.Error(err)
	// }

	// mappedPort, err := oracleContainer.MappedPort(ctx, "1521/tcp")
	// if err != nil {
	// 	t.Error(err)
		
	// }

	// jdbcDescriptionString := fmt.Sprintf(`(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=%s)(PORT=%s))(CONNECT_DATA=(SERVICE_NAME=FREEPDB1)))`,
	// 	host, mappedPort.Port())

	// jdbcDescriptionString := fmt.Sprintf(`oracle://system:mypassword@%s:%s/FREEPDB1)`, host, mappedPort.Port())

	// ... Use the JDBC String to connect to the Oracle DB in your tests here ...
	// ... And then run your tests ...

	sqltest.RunScript(t, "oracle", "oracle://system:mypassword@127.0.0.1:1521/FREEPDB1", script)

	// Stop the container after tests
	defer oracleContainer.Terminate(ctx)
}
